/**
 * Výsledkové listiny domácích akcí.
 *
 * Jednotlivé záznamy spravuje redakční systém v `src/obsah/vysledky/`,
 * soubory (.xlsx / .xls / .pdf) leží v `public/soubory/vysledky/`.
 */

import { collection, opt } from './_content';

export type ResultKind =
  | 'hry'
  | 'zavody'
  | 'drezura'
  | 'trenink'
  | 'sampionat'
  | 'kmk'
  | 'mikulas';

export interface ResultEntry {
  /** ISO datum konání */
  date: string;
  title: string;
  /** Cesta k souboru s výsledky (relativně ke kořeni webu) */
  file?: string;
}

export const resultKindLabels: Record<ResultKind, string> = {
  hry: 'Jezdecké hry',
  zavody: 'Závody',
  drezura: 'Drezura',
  trenink: 'Veřejný trénink',
  sampionat: 'Dětský šampionát',
  kmk: 'Kritéria mladých koní',
  mikulas: 'Mikulášská veselice',
};

/** Archiv ze starého webu kategorii neukládal — odvodíme ji z názvu. */
export function resultKind(title: string): ResultKind {
  const t = title.toUpperCase();
  if (t.includes('MIKUL')) return 'mikulas';
  if (t.includes('ŠAMPIONÁT')) return 'sampionat';
  if (t.includes('KMK') || t.includes('KRITÉRIA')) return 'kmk';
  if (t.includes('HRY')) return 'hry';
  if (t.includes('DREZUR')) return 'drezura';
  if (t.includes('TRÉNINK')) return 'trenink';
  return 'zavody';
}

export function resultYear(date: string): number {
  return Number(date.slice(0, 4));
}

interface RawResult {
  title: string;
  date: string;
  file?: string;
}

export const results: ResultEntry[] = collection<RawResult>(
  import.meta.glob('/src/obsah/vysledky/*.json', { eager: true }),
)
  .map((r) => ({ date: r.date, title: r.title, file: opt(r.file) }))
  .sort((a, b) => b.date.localeCompare(a.date));

/** Roky, ve kterých existují výsledky — pro filtr na stránce. */
export const resultYears: number[] = [
  ...new Set(results.map((r) => resultYear(r.date))),
].sort((a, b) => b - a);
