/**
 * Připojení přihlášek na akce k databázi.
 *
 * Přihlášky na akce jsou samostatný systém, s rezervacemi jízdáren nesdílí nic
 * kromě knihovny. Můžou běžet v jiném projektu Supabase (proměnné
 * `PRIHLASKY_SUPABASE_*`), a když nejsou vyplněné, použijí ten společný.
 * Přihlášení do správy má vlastní cookie, takže se nemíchá s účty jezdců.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { TypAkce } from './typy';

// Každá proměnná vypsaná zvlášť: Vite dosazuje `import.meta.env.X` při
// buildu jen tam, kde je název napsaný celý.
const url =
  import.meta.env.PRIHLASKY_SUPABASE_URL ||
  process.env.PRIHLASKY_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const anonKey =
  import.meta.env.PRIHLASKY_SUPABASE_ANON_KEY ||
  process.env.PRIHLASKY_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const prihlaskyNastaveny = Boolean(url && anonKey);

/**
 * Klient pro veřejnou stránku s přihláškou. Nikoho nepřihlašuje a nic si
 * nepamatuje, jen čte akce a volá `odeslat_prihlasku()`.
 */
export function verejnyKlient(): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const COOKIE = {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 14,
} as const;

/** Klient pro správu. Jeden na požadavek, session v cookie `prihlasky-auth`. */
export function klientSpravy(context: {
  request: Request;
  cookies: AstroCookies;
}): SupabaseClient {
  return createServerClient(url, anonKey, {
    cookieOptions: { name: 'prihlasky-auth' },
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

/* ------------------------------------------------------------------ typy */

export interface Polozka {
  kod: string;
  nazev: string;
  popis?: string;
  cena: number;
}

/**
 * Akce, na kterou se jde přihlásit. Typ určuje podobu formuláře
 * (viz typy.ts), `vyber` a `max_ucastniku` jeho rozsah.
 */
export interface Akce {
  kod: string;
  typ: TypAkce;
  nazev: string;
  podtitul: string;
  popis: string;
  zacatek: string;
  konec: string;
  nastup: string;
  odjezd: string;
  vek_od: number | null;
  kapacita: number;
  /** Kolik účastníků smí být na jedné přihlášce. */
  max_ucastniku: number;
  /** `jedna` = z ceníku se vybírá jedna položka, `vice` = klidně několik. */
  vyber: 'jedna' | 'vice';
  splatnost_dni: number;
  /** Platební údaje se ukážou hned po odeslání, bez čekání na potvrzení. */
  platba_hned: boolean;
  varianty: Polozka[];
  priplatky: Polozka[];
  otevreno: boolean;
}

/** Jeden přihlášený. Která pole jsou vyplněná, závisí na typu akce. */
export interface Ucastnik {
  jmeno: string;
  narozeni?: string;
  kun?: string;
  zkusenosti?: string;
  uroven?: string;
  licence?: string;
  pojistovna?: string;
  zdravi?: string;
  /** Ceníkové položky tak, jak platily v okamžiku odeslání. */
  polozky: Polozka[];
  cena: number;
}

export type StavPrihlasky = 'nova' | 'prijata' | 'nahradnik' | 'odmitnuta' | 'zrusena';

export const stavy: Record<StavPrihlasky, string> = {
  nova: 'Nová',
  prijata: 'Přijatá',
  nahradnik: 'Náhradník',
  odmitnuta: 'Odmítnutá',
  zrusena: 'Zrušená',
};

export interface Prihlaska {
  id: string;
  vs: string;
  akce: string;
  ucastnici: Ucastnik[];
  cena: number;
  subjekt: string;
  kontakt_jmeno: string;
  kontakt_email: string;
  kontakt_telefon: string;
  kontakt_adresa: string;
  /** osoba = převodem, firma = na fakturu, misto = hotově při akci */
  platce: 'osoba' | 'firma' | 'misto';
  firma_ico: string;
  firma_nazev: string;
  firma_adresa: string;
  firma_dic: string;
  firma_email: string;
  firma_objednavka: string;
  poznamka: string;
  souhlas_foto: boolean;
  stav: StavPrihlasky;
  zaplaceno: string | null;
  faktura_cislo: string;
  poznamka_staje: string;
  vytvoreno: string;
  zmeneno: string;
}

/** Souhrn přihlášky do jednoho řádku: „Anna Nováková, Jiskra + 2 další“. */
export function jmenaUcastniku(p: Pick<Prihlaska, 'ucastnici'>): string {
  const jmena = p.ucastnici.map((u) => u.jmeno);
  if (jmena.length === 0) return 'bez účastníka';
  if (jmena.length <= 2) return jmena.join(' a ');
  return `${jmena[0]} a ${jmena.length - 1} další`;
}

/**
 * Hlášky z databáze jsou psané česky pro člověka, ty pustíme ven.
 * Cokoli jiného se schová za obecnou větu.
 */
export function citelnaChyba(chyba: { message?: string } | null): string {
  const zprava = chyba?.message ?? '';

  if (/Invalid login credentials/i.test(zprava)) return 'Nesprávný e-mail nebo heslo.';
  if (/rate limit|too many requests/i.test(zprava)) {
    return 'Příliš mnoho pokusů po sobě. Zkuste to prosím za chvíli.';
  }
  if (/[ěščřžýáíéúůňťď]/i.test(zprava) && zprava.length < 200) return zprava;
  return 'Něco se nepovedlo. Zkuste to prosím znovu.';
}
