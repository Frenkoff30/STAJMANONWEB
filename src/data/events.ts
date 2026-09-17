/**
 * Kalendář jezdeckých akcí.
 *
 * Jednotlivé akce spravuje redakční systém v `src/obsah/akce/`.
 * Stránka /akce se sama rozdělí na „nadcházející" a „archiv" podle dne buildu.
 */

import { collection, opt } from './_content';

export type EventKind =
  | 'zavody'
  | 'drezura'
  | 'vsestrannost'
  | 'hry'
  | 'soustredeni'
  | 'pobyt'
  | 'chov'
  | 'zkousky'
  | 'sprezeni'
  | 'vrchol';

export interface StableEvent {
  /** ISO datum začátku (YYYY-MM-DD) */
  start: string;
  /** ISO datum konce, pokud je akce vícedenní */
  end?: string;
  title: string;
  /** Disciplíny / úrovně — text v lomítkách ze starého webu */
  detail?: string;
  kind: EventKind;
  /** Vrcholná akce sezóny — vykreslí se zvýrazněně */
  highlight?: boolean;
  /** Rozpis ke stažení */
  file?: { label: string; href: string };
  /** Kód tábora v přihláškách, u akce se pak ukáže tlačítko „Přihlásit se“ */
  prihlaska?: string;
}

export const eventKindLabels: Record<EventKind, string> = {
  zavody: 'Skokové závody',
  drezura: 'Drezura',
  vsestrannost: 'Všestrannost',
  hry: 'Jezdecké hry pro děti',
  soustredeni: 'Soustředění',
  pobyt: 'Pobyt s výukou',
  chov: 'Chovatelská akce',
  zkousky: 'Zkoušky',
  sprezeni: 'Spřežení',
  vrchol: 'Vrchol sezóny',
};

interface RawEvent {
  title: string;
  start: string;
  end?: string;
  detail?: string;
  kind: EventKind;
  highlight?: boolean;
  file?: { label: string; href: string } | null;
  prihlaska?: string;
}

export const events: StableEvent[] = collection<RawEvent>(
  import.meta.glob('/src/obsah/akce/*.json', { eager: true }),
)
  .map((e) => ({
    start: e.start,
    end: opt(e.end),
    title: e.title,
    detail: opt(e.detail),
    kind: e.kind,
    highlight: e.highlight === true,
    file: e.file && opt(e.file.href) ? e.file : undefined,
    prihlaska: opt(e.prihlaska),
  }))
  .sort((a, b) => a.start.localeCompare(b.start));

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

/** Akce, která ještě neskončila (počítáno k dnešnímu dni buildu). */
export function isUpcoming(e: StableEvent, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parseDate(e.end ?? e.start) >= today;
}

export function upcomingEvents(now = new Date()): StableEvent[] {
  return events
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Nadcházející akce bez interních pobytů a kurzů — ty mají vlastní stránky
 * a v teaseru na homepage by jen zabraly místo skutečným závodům.
 * Výjimkou je pobyt s online přihláškou, na ten se jde přihlásit rovnou.
 */
export function upcomingPublicEvents(now = new Date()): StableEvent[] {
  return upcomingEvents(now).filter((e) => e.kind !== 'pobyt' || e.prihlaska);
}

export function pastEvents(now = new Date()): StableEvent[] {
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
