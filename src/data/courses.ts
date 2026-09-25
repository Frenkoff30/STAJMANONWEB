/**
 * Prázdninové jezdecké kurzy — turnusy, ceník a program.
 * Obsah spravuje redakční systém v `src/obsah/kurzy.json`.
 */

import { opt } from './_content';
import data from '../obsah/kurzy.json';

export type TurnusStatus = 'volno' | 'posledni' | 'obsazeno' | 'uzavreno';

export interface Turnus {
  n: number;
  /** Název akce. Prázdné = vypíše se „Turnus 3“. */
  nazev?: string;
  start: string;
  /** Konec u vícedenních turnusů. Jednodenní akce ho nemají. */
  end?: string;
  status: TurnusStatus;
  /** Doplňující text k volným místům */
  note?: string;
  /** Kód akce v přihláškách. Vyplněný = tlačítko vede na online formulář. */
  prihlaska?: string;
}

export const turnusStatusLabels: Record<TurnusStatus, string> = {
  volno: 'Volná místa',
  posledni: 'Poslední místa',
  obsazeno: 'Obsazeno',
  uzavreno: 'Uzavřeno',
};

/** Turnus tak, jak ho ukládá redakční systém. Prázdné datum klíč vynechá. */
interface RawTurnus {
  n: number;
  nazev?: string;
  start: string;
  end?: string;
  status: string;
  note?: string;
  prihlaska?: string;
}

export const turnusy: Turnus[] = (data.turnusy as RawTurnus[])
  .map((t) => ({
    n: t.n,
    nazev: opt(t.nazev),
    start: t.start,
    end: opt(t.end),
    status: t.status as TurnusStatus,
    note: opt(t.note),
    prihlaska: opt(t.prihlaska),
  }))
  .sort((a, b) => a.start.localeCompare(b.start));

/** Jak se turnus jmenuje ve výpisu. */
export function turnusLabel(t: Turnus): string {
  return t.nazev ?? `Turnus ${t.n}`;
}

export const kurzCena = data.cena;

export interface ProgramBlock {
  title: string;
  text: string;
}

export const kurzProgram: ProgramBlock[] = data.program;

export const kurzIncluded: string[] = data.included;

export const kurzPacking: string[] = data.packing;

export interface StornoRule {
  when: string;
  fee: string;
}

export const stornoPodminky: StornoRule[] = data.storno;
