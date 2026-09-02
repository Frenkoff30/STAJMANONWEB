/**
 * Prázdninové jezdecké kurzy — turnusy, ceník a program.
 * Obsah spravuje redakční systém v `src/obsah/kurzy.json`.
 */

import { opt } from './_content';
import data from '../obsah/kurzy.json';

export type TurnusStatus = 'volno' | 'posledni' | 'obsazeno' | 'uzavreno';

export interface Turnus {
  n: number;
  start: string;
  end: string;
  status: TurnusStatus;
  /** Doplňující text k volným místům */
  note?: string;
}

export const turnusStatusLabels: Record<TurnusStatus, string> = {
  volno: 'Volná místa',
  posledni: 'Poslední místa',
  obsazeno: 'Obsazeno',
  uzavreno: 'Uzavřeno',
};

export const turnusy: Turnus[] = data.turnusy
  .map((t) => ({
    n: t.n,
    start: t.start,
    end: t.end,
    status: t.status as TurnusStatus,
    note: opt(t.note),
  }))
  .sort((a, b) => a.start.localeCompare(b.start));

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
