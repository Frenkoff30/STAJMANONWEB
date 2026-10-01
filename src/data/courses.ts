/**
 * Prázdninové jezdecké kurzy — ceník a program. Obsah spravuje redakční
 * systém v `src/obsah/kurzy.json`. Termíny (turnusy) jsou akce druhu
 * „Tábor“ ve Správě webu, viz src/components/kalendar/KurzyTerminy.astro.
 */

import data from '../obsah/kurzy.json';

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
