/**
 * Pobyty s intenzivní výukou jízdy na koni (Velikonoce, podzimní prázdniny).
 * Spravuje redakční systém v `src/obsah/pobyty/`.
 */

import { collection, opt } from './_content';

export interface Stay {
  slug: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  dateLabel: string;
  arrival: string;
  departure: string;
  lessons: string;
  extras: string;
  ageFrom: number;
  description: string;
  price: string;
  priceNotes: string[];
  /** Kód akce v přihláškách. Vyplněný = tlačítko vede na online formulář. */
  prihlaska?: string;
}

export const stays: Stay[] = collection<Omit<Stay, 'slug'>>(
  import.meta.glob('/src/obsah/pobyty/*.json', { eager: true }),
)
  .map((s) => ({ ...s, prihlaska: opt(s.prihlaska) }))
  .sort((a, b) => a.start.localeCompare(b.start));
