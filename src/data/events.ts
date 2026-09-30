/**
 * Kalendář jezdeckých akcí.
 *
 * Akce se zadávají ve správě na webu (/prihlasky/sprava) a leží v databázi,
 * načítá je src/lib/kalendar.ts. Tady jsou jen typy a pomocné funkce.
 */

export type EventKind =
  | 'zavody'
  | 'drezura'
  | 'vsestrannost'
  | 'sprezeni'
  | 'zkousky'
  | 'hry'
  | 'soustredeni'
  | 'tabor'
  | 'pobyt'
  | 'chov'
  | 'jina';

export interface StableEvent {
  /** ISO datum začátku (YYYY-MM-DD) */
  start: string;
  /** ISO datum konce, pokud je akce vícedenní */
  end?: string;
  title: string;
  /** Krátký popis pod názvem */
  detail?: string;
  kind: EventKind;
  /** Vrcholná akce sezóny — vykreslí se zvýrazněně */
  highlight?: boolean;
  /** Rozpis ke stažení */
  file?: { label: string; href: string };
  /** Kód akce, když se na ni jde přihlásit online */
  prihlaska?: string;
}

/** Druhy akcí v pořadí, v jakém se nabízí ve správě i v legendě. */
export const eventKindLabels: Record<EventKind, string> = {
  zavody: 'Skokové závody',
  drezura: 'Drezura',
  vsestrannost: 'Všestrannost',
  sprezeni: 'Spřežení',
  zkousky: 'Zkoušky',
  hry: 'Jezdecké hry pro děti',
  soustredeni: 'Soustředění',
  tabor: 'Tábor',
  pobyt: 'Pobyt s výukou',
  chov: 'Chovatelská akce',
  jina: 'Jiná akce',
};

/* ------------------------------------------------------------------ utils */

const CZ_DAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'] as const;
const CZ_MONTHS = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince',
] as const;
const CZ_MONTHS_NOM = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
] as const;

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function formatDay(iso: string): string {
  const d = parseDate(iso);
  return `${CZ_DAYS[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
}

export function formatLong(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()}. ${CZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthName(index: number): string {
  return CZ_MONTHS_NOM[index] ?? '';
}

/** „3.–6. září 2026" nebo „30. srpna 2026" */
export function formatRange(e: StableEvent): string {
  const s = parseDate(e.start);
  if (!e.end) return formatLong(e.start);
  const t = parseDate(e.end);
  if (s.getMonth() === t.getMonth() && s.getFullYear() === t.getFullYear()) {
    return `${s.getDate()}.–${t.getDate()}. ${CZ_MONTHS[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()}. ${CZ_MONTHS[s.getMonth()]} – ${t.getDate()}. ${CZ_MONTHS[t.getMonth()]} ${t.getFullYear()}`;
}

/** Akce, která ještě neskončila. */
export function isUpcoming(e: StableEvent, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parseDate(e.end ?? e.start) >= today;
}

export function upcomingEvents(events: StableEvent[], now = new Date()): StableEvent[] {
  return events
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Nadcházející akce bez interních pobytů a kurzů — ty mají vlastní stránky
 * a v teaseru na homepage by jen zabraly místo skutečným závodům.
 * Výjimkou je pobyt s online přihláškou, na ten se jde přihlásit rovnou.
 */
export function upcomingPublicEvents(events: StableEvent[], now = new Date()): StableEvent[] {
  return upcomingEvents(events, now).filter(
    (e) => (e.kind !== 'pobyt' && e.kind !== 'tabor') || e.prihlaska,
  );
}

export function pastEvents(events: StableEvent[], now = new Date()): StableEvent[] {
  return events
    .filter((e) => !isUpcoming(e, now))
    .sort((a, b) => b.start.localeCompare(a.start));
}

/** Seskupení do měsíců pro výpis kalendáře. */
export function groupByMonth(list: StableEvent[]) {
  const map = new Map<string, StableEvent[]>();
  for (const e of list) {
    const key = e.start.slice(0, 7);
    const bucket = map.get(key);
    if (bucket) bucket.push(e);
    else map.set(key, [e]);
  }
  return [...map.entries()].map(([key, items]) => {
    const [y, m] = key.split('-').map(Number);
    return { key, year: y!, month: m! - 1, label: `${monthName(m! - 1)} ${y}`, items };
  });
}
