/**
 * Kdo je přihlášený ve správě přihlášek.
 *
 * Tohle je jen zámek na dveřích stránek. Co správce smí číst a měnit,
 * rozhodují pravidla v databázi (`je_spravce_prihlasek()`), takže ani
 * obejitá stránka nikomu cizímu přihlášky neukáže.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { klientSpravy, prihlaskyNastaveny } from './db';

export interface Spravce {
  supabase: SupabaseClient;
  id: string;
  email: string;
  jmeno: string;
}

/**
 * Hned po přihlášení je potřeba předat klienta, který přihlášení provedl:
 * nová session je zatím jen v něm, v cookies požadavku ještě není.
 */
export async function nactiSpravce(
  context: { request: Request; cookies: AstroCookies },
  klient?: SupabaseClient,
): Promise<Spravce | null> {
  if (!prihlaskyNastaveny) return null;

  const supabase = klient ?? klientSpravy(context);

  // `getUser()` nechá token ověřit u Supabase, cookie sama o sobě nestačí.
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: zaznam } = await supabase
    .from('prihlasky_spravci')
    .select('jmeno')
    .eq('uzivatel', data.user.id)
    .maybeSingle<{ jmeno: string }>();

  if (!zaznam) return null;

  return {
    supabase,
    id: data.user.id,
    email: data.user.email ?? '',
    jmeno: zaznam.jmeno,
  };
}

/** `2026-09-17T09:21:00Z` → `17. září 2026 11:21` v českém čase. */
export function datumCas(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Stránky správy se nesmí uložit do mezipaměti prohlížeče ani CDN. */
export function bezCache(headers: Headers) {
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('X-Robots-Tag', 'noindex, noarchive');
}
