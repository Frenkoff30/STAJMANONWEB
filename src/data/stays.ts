/**
 * Pobyty s intenzivní výukou jízdy na koni (Velikonoce, podzimní prázdniny).
 * Spravuje redakční systém v `src/obsah/pobyty/`.
 */

import { collection } from './_content';

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
}

export const stays: Stay[] = collection<Omit<Stay, 'slug'>>(
  import.meta.glob('/src/obsah/pobyty/*.json', { eager: true }),
).sort((a, b) => a.start.localeCompare(b.start));
