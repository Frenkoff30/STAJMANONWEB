/**
 * Novinky — krátké zprávy ze stáje (změna termínu, startovní listiny,
 * pozvánky). Píšou se ve správě webu (/prihlasky/sprava/novinky) a leží
 * v databázi, web je čte až při zobrazení, takže nová novinka je venku hned.
 *
 * Každá má vlastní adresu /novinky/<slug>, aby šla sdílet na Facebook
 * s vlastním nadpisem a fotkou.
 */

import { prihlaskyNastaveny, verejnyKlient } from '@/lib/prihlasky/db';

/** Řádek tabulky `novinky`. */
export interface Novinka {
  id: string;
  slug: string;
  nadpis: string;
  /** ISO datum (YYYY-MM-DD) */
  datum: string;
  text: string;
  foto_url: string;
  soubor_url: string;
  soubor_nazev: string;
  odkaz_url: string;
  odkaz_nazev: string;
}

/** Text rozdělený na odstavce podle prázdných řádků. */
export function odstavce(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Nejnovější první; ve stejný den rozhoduje, co vzniklo později. */
const RAZENI = [
  { sloupec: 'datum', vzestupne: false },
  { sloupec: 'vytvoreno', vzestupne: false },
] as const;

/**
 * Novinky od nejnovější. Když databáze neodpoví, vrátí prázdný seznam —
 * stránka se ukáže bez novinek, ale nespadne.
 */
export async function nactiNovinky(limit?: number): Promise<Novinka[]> {
  if (!prihlaskyNastaveny) return [];

  let dotaz = verejnyKlient().from('novinky').select('*');
  for (const r of RAZENI) dotaz = dotaz.order(r.sloupec, { ascending: r.vzestupne });
  if (limit) dotaz = dotaz.limit(limit);

  const { data, error } = await dotaz;
  if (error) {
    console.error('Novinky se nenačetly', error.message);
    return [];
  }
  return data as Novinka[];
}

export async function nactiNovinku(slug: string): Promise<Novinka | null> {
  if (!prihlaskyNastaveny || !/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  const { data } = await verejnyKlient()
    .from('novinky')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as Novinka | null) ?? null;
}

/** „Změna termínu her!“ → `zmena-terminu-her`. Bez diakritiky, do 70 znaků. */
export function slugZNadpisu(nadpis: string): string {
  return nadpis
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '');
}

/** Odkaz, kterým se novinka sdílí na Facebook. */
export function facebookShare(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Hlavička pro stránky s novinkami: krátce do mezipaměti, pak znovu z databáze. */
export const CACHE_NOVINEK = 'public, max-age=0, s-maxage=30, stale-while-revalidate=300';
