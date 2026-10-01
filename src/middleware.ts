/**
 * Běží před každým serverovým požadavkem.
 *
 * Zbytek webu je statický, takže se tohle týká jen `/rezervace/*`. Načte
 * přihlášeného člověka, jeho profil a odsud dál už žádná stránka neřeší,
 * jestli má někdo právo tam být, jen si vezme `Astro.locals`.
 */

import { defineMiddleware } from 'astro:middleware';
import { rezervaceNastaveny, vytvorKlienta, type Profil } from '@/lib/supabase';

/** Kam se nedostane nepřihlášený. */
const JEN_PRIHLASENI = ['/rezervace/moje', '/rezervace/nova', '/rezervace/ucet'];

/** Kam se nedostane nikdo kromě správce. */
const JEN_SPRAVCE = ['/rezervace/sprava'];

/* ------------------------------------------------------- režim „připravujeme" */

const udrzba = import.meta.env.UDRZBA === '1' || process.env.UDRZBA === '1';

/** Tajné slovo do adresy (`?klic=…`), kterým si web otevře stáj. */
const udrzbaKlic = import.meta.env.UDRZBA_KLIC || process.env.UDRZBA_KLIC || '';

const SUSENKA_PRISTUP = 'pristup-pred-spustenim';

/**
 * Co zůstává otevřené i při zavřeném webu: přihlašování a administrace
 * (schované za heslem tak jako tak) a soubory, bez kterých by se stránka
 * „připravujeme" nevykreslila.
 */
const UDRZBA_POVOLENO = [
  '/pripravujeme',
  '/rezervace',
  '/prihlasky',
  '/keystatic',
  '/api/keystatic',
  '/_astro',
  '/_image',
  '/_server-islands',
  '/favicon.svg',
  '/favicon-96.png',
  '/apple-touch-icon.png',
  '/robots.txt',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const cesta = context.url.pathname.replace(/\/+$/, '') || '/';

  if (udrzba) {
    /* Odkaz s klíčem pustí prohlížeč dovnitř natrvalo: klíč se vymění za
       sušenku, ať ho stáj nemusí tahat v adrese na každé stránce. */
    const klic = context.url.searchParams.get('klic');
    if (udrzbaKlic && klic === udrzbaKlic) {
      context.cookies.set(SUSENKA_PRISTUP, udrzbaKlic, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: context.url.protocol === 'https:',
        maxAge: 60 * 60 * 24 * 30,
      });
      const bezKlice = new URL(context.url);
      bezKlice.searchParams.delete('klic');
      return context.redirect(bezKlice.pathname + bezKlice.search);
    }

    const pusten =
      Boolean(udrzbaKlic) && context.cookies.get(SUSENKA_PRISTUP)?.value === udrzbaKlic;

    const povoleno = UDRZBA_POVOLENO.some(
      (p) => cesta === p || cesta.startsWith(`${p}/`),
    );

    if (!pusten && !povoleno) {
      /* Vyhledávačům a archivům říct, že tohle není trvalý stav webu. */
      const odpoved = await context.rewrite('/pripravujeme');
      odpoved.headers.set('Cache-Control', 'no-store');
      odpoved.headers.set('X-Robots-Tag', 'noindex');
      return new Response(odpoved.body, {
        status: 503,
        headers: odpoved.headers,
      });
    }
  }

  if (!cesta.startsWith('/rezervace')) return next();

  context.locals.supabase = null;
  context.locals.uzivatel = null;
  context.locals.profil = null;

  if (rezervaceNastaveny) {
    const supabase = vytvorKlienta(context);
    context.locals.supabase = supabase;

    // `getUser()`, ne `getSession()`. Session se čte jen z cookie a ta se dá
    // podvrhnout. `getUser()` nechá token ověřit u Supabase.
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      context.locals.uzivatel = { id: data.user.id, email: data.user.email ?? '' };

      const { data: profil } = await supabase
        .from('profily')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle<Profil>();

      if (profil) {
        context.locals.profil = profil;
      } else {
        // Profil normálně zakládá trigger v databázi hned při registraci.
        // Účet vzniklý jinudy (pozvánka z administrace Supabase) by ale
        // zůstal bez profilu a nešel by schválit. Doplníme ho tady.
        const udaje = data.user.user_metadata ?? {};
        const { data: zalozeny } = await supabase
          .from('profily')
          .insert({
            id: data.user.id,
            jmeno: String(udaje.jmeno ?? '').trim().slice(0, 80),
            telefon: String(udaje.telefon ?? '').trim().slice(0, 30),
          })
          .select()
          .maybeSingle<Profil>();

        context.locals.profil = zalozeny ?? null;
      }
    }
  }

  const prihlasen = Boolean(context.locals.uzivatel);
  const spravce = context.locals.profil?.role === 'spravce';

  /** Sedí cesta na některou z chráněných? Podstránky ano, `/rezervace/novak` ne. */
  const spada = (seznam: string[]) =>
    seznam.some((p) => cesta === p || cesta.startsWith(`${p}/`));

  if (spada(JEN_SPRAVCE) && !spravce) {
    return context.redirect(
      prihlasen ? '/rezervace' : `/rezervace/prihlaseni?dal=${encodeURIComponent(cesta)}`,
    );
  }

  if (spada(JEN_PRIHLASENI) && !prihlasen) {
    const dal = context.url.pathname + context.url.search;
    return context.redirect(`/rezervace/prihlaseni?dal=${encodeURIComponent(dal)}`);
  }

  const odpoved = await next();

  // Stránky s rezervacemi se nesmí uložit do mezipaměti prohlížeče ani CDN.
  // Jinak by se po odhlášení dal tlačítkem zpět zobrazit cizí kalendář.
  odpoved.headers.set('Cache-Control', 'private, no-store, max-age=0');
  odpoved.headers.set('X-Robots-Tag', 'noarchive');

  return odpoved;
});
