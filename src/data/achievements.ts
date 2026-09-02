/**
 * Sportovní úspěchy Stáje Manon.
 *
 * Jeden soubor na rok v `src/obsah/uspechy/`, spravuje redakční systém.
 */

import { collection, opt } from './_content';

export interface Achievement {
  /** „1.", „2."… nebo prázdné u titulů */
  place?: string;
  event: string;
  rider: string;
  horse?: string;
  /** Vítězství v seriálu / titul — vykreslí se zvýrazněně */
  major?: boolean;
}

export interface AchievementYear {
  year: number;
  items: Achievement[];
}

interface RawYear {
  year: string;
  items: Array<{
    place?: string;
    event: string;
    rider: string;
    horse?: string;
    major?: boolean;
  }>;
}

export const achievements: AchievementYear[] = collection<RawYear>(
  import.meta.glob('/src/obsah/uspechy/*.json', { eager: true }),
)
  .map((y) => ({
    year: Number(y.year),
    items: (y.items ?? []).map((i) => ({
      place: opt(i.place),
      event: i.event,
      rider: i.rider,
      horse: opt(i.horse),
      major: i.major === true,
    })),
  }))
  .sort((a, b) => b.year - a.year);

/**
 * Zkratkový přehled hlavních titulů (hero, /o-nas, /jiri-skrivan).
 * Je to ručně sestavený výběr, ne automatický výtah z výsledků výše —
 * proto má vlastní soubor `src/obsah/tituly.json`.
 */
import tituly from '../obsah/tituly.json';

export interface MajorTitle {
  year: string;
  text: string;
}

export const majorTitles: MajorTitle[] = (tituly.items ?? []).map((t) => ({
  year: String(t.year),
  text: t.text,
}));
