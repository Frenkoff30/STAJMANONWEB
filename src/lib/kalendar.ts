/**
 * Kalendář akcí z databáze.
 *
 * Akce se zadávají ve správě (/prihlasky/sprava) do stejné tabulky jako
 * akce s přihláškami. Web je čte až při zobrazení stránky, takže nová akce
 * je v kalendáři hned po uložení, bez nového nasazení webu.
 */

import type { EventKind, StableEvent } from '@/data/events';
import { prihlaskyNastaveny, verejnyKlient, type Akce } from '@/lib/prihlasky/db';

type RadekKalendare = Pick<
  Akce,
  | 'kod'
  | 'druh'
  | 'nazev'
  | 'podtitul'
  | 'zacatek'
  | 'konec'
  | 'zvyraznit'
  | 'prihlasovani'
  | 'rozpis_nazev'
  | 'rozpis_url'
>;

export function naUdalost(a: RadekKalendare): StableEvent {
  return {
    start: a.zacatek,
    end: a.konec && a.konec !== a.zacatek ? a.konec : undefined,
    title: a.nazev,
    detail: a.podtitul || undefined,
    kind: a.druh as EventKind,
    highlight: a.zvyraznit,
    file: a.rozpis_url ? { label: a.rozpis_nazev || 'Rozpis', href: a.rozpis_url } : undefined,
    prihlaska: a.prihlasovani ? a.kod : undefined,
  };
}

/**
 * Všechny akce seřazené podle začátku. Když databáze neodpoví, vrátí
 * prázdný seznam — stránka se ukáže bez akcí, ale nespadne.
 */
export async function nactiKalendar(): Promise<StableEvent[]> {
  if (!prihlaskyNastaveny) return [];

  const { data, error } = await verejnyKlient()
    .from('akce')
    .select(
      'kod, druh, nazev, podtitul, zacatek, konec, zvyraznit, prihlasovani, rozpis_nazev, rozpis_url',
    )
    .order('zacatek', { ascending: true });

  if (error) {
    console.error('Kalendář se nenačetl', error.message);
    return [];
  }
  return (data as RadekKalendare[]).map(naUdalost);
}

/** Hlavička pro stránky s kalendářem: krátce do mezipaměti, pak znovu z databáze. */
export const CACHE_KALENDARE = 'public, max-age=0, s-maxage=30, stale-while-revalidate=300';
