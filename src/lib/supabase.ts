/**
 * Připojení k Supabase (databáze + přihlašování).
 *
 * Session se drží v cookies, které nastavuje výhradně server. Do JavaScriptu
 * v prohlížeči se přihlašovací token nedostane, takže ho nemá jak ukrást ani
 * podvržený skript na stránce.
 *
 * Klíč `SUPABASE_ANON_KEY` je určený k veřejnému použití. Co s ním kdo smí,
 * neurčuje web, ale pravidla Row Level Security v `supabase/schema.sql`.
 */

import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

/**
 * Proměnné se čtou i z `process.env`, aby šly na Vercelu změnit bez nového
 * buildu. Když chybí, systém se sám vypne místo aby spadl celý web.
 */
const url =
  import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey =
  import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const rezervaceNastaveny = Boolean(url && anonKey);

/** Doba platnosti cookie. Přihlášení vydrží měsíc, pak se přihlašuje znovu. */
const COOKIE = {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 30,
} as const;

/**
 * Klient pro jeden konkrétní požadavek. Nikdy se nesdílí mezi požadavky,
 * jinak by se session jednoho člověka mohla ukázat jinému.
 */
export function vytvorKlienta(context: {
  request: Request;
  cookies: AstroCookies;
}): SupabaseClient {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
      },
      setAll(cookies) {
        for (const { name, value, options } of cookies) {
          context.cookies.set(name, value, { ...COOKIE, ...options });
        }
      },
    },
  });
}

/**
 * Servisní klíč obchází Row Level Security, proto se smí použít jen na serveru
 * a jen tam, kde si web sám ověřil, že žádost poslal správce. Do prohlížeče se
 * nesmí dostat nikdy — proto nemá předponu `PUBLIC_`.
 *
 * Slouží k jedinému účelu: úplnému smazání člena. Rušit účty v `auth.users`
 * běžný klíč neumí, je to výhradně správcovská operace.
 */
const servisniKlic =
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

/** Bez servisního klíče se v administraci mazání členů jen skryje. */
export const mazaniClenuNastaveno = Boolean(url && servisniKlic);

/**
 * Klient s právy správce databáze. Session neřeší a cookies nečte — vzniká
 * pro jednu operaci a hned zaniká.
 */
export function vytvorServisnihoKlienta(): SupabaseClient {
  return createClient(url, servisniKlic, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Profil jezdce tak, jak ho čte web. */
export interface Profil {
  id: string;
  jmeno: string;
  telefon: string;
  role: 'clen' | 'spravce';
  schvaleno: boolean;
  poznamka: string;
  vytvoreno: string;
}

/**
 * Chybové hlášky z databáze jsou psané česky a pro člověka, tak je pustíme
 * ven. Cokoli jiného (výpadek sítě, chyba v dotazu) se schová za obecnou
 * větu, ať se ven neprosákne vnitřek databáze.
 */
export function citelnaChyba(chyba: { message?: string } | null): string {
  const zprava = chyba?.message ?? '';

  if (/Invalid login credentials/i.test(zprava)) {
    return 'Nesprávný e-mail nebo heslo.';
  }
  if (/Email not confirmed/i.test(zprava)) {
    return 'Nejdřív prosím potvrďte e-mail odkazem, který jsme vám poslali.';
  }
  if (/User already registered|already been registered/i.test(zprava)) {
    return 'Účet s tímhle e-mailem už existuje. Zkuste se přihlásit.';
  }
  if (/Password should be at least/i.test(zprava)) {
    return 'Heslo musí mít aspoň 8 znaků.';
  }
  if (/rate limit|too many requests/i.test(zprava)) {
    return 'Příliš mnoho pokusů po sobě. Zkuste to prosím za chvíli.';
  }
  if (/duplicate key value/i.test(zprava)) {
    return 'Tenhle termín už máte zarezervovaný.';
  }
  /* Databáze je o úpravu pozadu. Hláška míří na správce, protože běžný člen
     s tím nic nenadělá — a mlčet by znamenalo hádat, co se stalo. */
  if (/schema cache|column .* does not exist|pocet_koni|doporuceni_koni/i.test(zprava)) {
    return (
      'Databáze ještě nemá úpravu pro počet koní a opakování. ' +
      'Spusťte v Supabase (SQL Editor) soubor supabase/uprava-rezervace-provoz.sql.'
    );
  }
  // Vlastní hlášky z triggerů v databázi končí tečkou a jsou česky.
  if (/[ěščřžýáíéúůňťď]/i.test(zprava) && zprava.length < 200) {
    return zprava;
  }
  return 'Něco se nepovedlo. Zkuste to prosím znovu.';
}
