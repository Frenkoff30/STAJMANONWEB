/**
 * Kalendář jezdeckých akcí. Přepsáno z původního akce.php.
 *
 * Přidání akce = jeden řádek v poli `events`. Stránka /akce se sama rozdělí
 * na „nadcházející" a „archiv" podle dnešního data — nic dalšího není potřeba.
 */

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
  /** Rozpis ke stažení (přenesené soubory ze starého webu) */
  file?: { label: string; href: string };
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

export const events: StableEvent[] = [
  // ---------------------------------------------------------------- 2026
  { start: '2026-01-11', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-01-18', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-01-25', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },

  { start: '2026-02-01', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-02-08', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-02-15', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-02-22', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },

  { start: '2026-03-01', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-03-07', title: 'Drezurní halové závody', detail: 'hobby, Z–S', kind: 'drezura' },
  { start: '2026-03-08', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-03-15', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-03-21', title: 'Drezurní halové závody', detail: 'hobby, Z–S', kind: 'drezura' },
  { start: '2026-03-22', title: 'Zimní skoková příprava', detail: 'Skokové soustředění s Jiřím Skřivanem + OCM VČO', kind: 'soustredeni' },
  { start: '2026-03-29', title: 'Jezdecké hry pro děti', detail: 'jízdy zručnosti, křížkový parkur, parkur 40/50 a 50/60 cm', kind: 'hry', file: { label: 'Rozpis (DOC)', href: '/soubory/akce/rozpis-jezdecke-hry-2026-brezen.doc' } },

  { start: '2026-04-02', end: '2026-04-06', title: 'Velikonoční pobyt s výukou jízdy na koni', detail: 'Po krůčcích k ZZVJ', kind: 'pobyt' },
  { start: '2026-04-04', title: 'Dubnové jezdecké závody', detail: 'hobby, Z–S + pony, ČP STYL PONY', kind: 'zavody' },
  { start: '2026-04-11', end: '2026-04-12', title: 'Jarní závody ve všestrannosti', detail: 'hobby, Z–ZL, pony', kind: 'vsestrannost' },
  { start: '2026-04-18', title: 'Drezurní jezdecké závody', detail: 'hobby, Z–S', kind: 'drezura' },
  { start: '2026-04-19', title: 'Jarní závody ve všestrannosti', detail: 'hobby, Z–ZL, pony', kind: 'vsestrannost' },
  { start: '2026-04-25', title: 'Drezurní jezdecké závody', detail: 'hobby, Z–S', kind: 'drezura' },
  { start: '2026-04-26', title: 'Jarní závody ve všestrannosti', detail: 'hobby, Z–ZL, pony', kind: 'vsestrannost' },

  { start: '2026-05-01', title: 'ZZVJ', detail: 'Základní zkoušky výcviku jezdce', kind: 'zkousky' },
  { start: '2026-05-02', title: 'Květnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
  { start: '2026-05-06', title: 'Jarní třídění hřebců v Pazuše', detail: 'od 10.00 hod', kind: 'chov' },
  { start: '2026-05-12', title: 'Kritéria mladých koní', kind: 'zavody' },
  { start: '2026-05-16', title: 'Květnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
  { start: '2026-05-17', title: 'Jezdecké hry pro děti', detail: 'jízdy zručnosti, křížkový parkur, parkury 40 a 60 cm', kind: 'hry', file: { label: 'Rozpis (DOC)', href: '/soubory/akce/rozpis-jezdecke-hry-2026-kveten.doc' } },
  { start: '2026-05-30', title: 'Drezurní jezdecké závody', detail: 'hobby, Z–S', kind: 'drezura' },

  { start: '2026-06-03', title: 'Zkoušky základního výcviku hřebců', detail: 'areál JK Hřebčín Suchá, od 10.00 hod', kind: 'chov' },
  { start: '2026-06-05', end: '2026-06-07', title: 'Červnové jezdecké závody', detail: 'hobby, Z–ST, ČP styl, ČSP PONY', kind: 'zavody' },
  { start: '2026-06-13', title: 'Červnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
  { start: '2026-06-14', title: 'Jezdecké hry pro děti', detail: 'jízdy zručnosti, křížkový parkur, parkury 40 a 60 cm', kind: 'hry', file: { label: 'Rozpis (DOC)', href: '/soubory/akce/rozpis-jezdecke-hry-2026-cerven.doc' } },
  { start: '2026-06-27', end: '2026-06-28', title: 'Červnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },

  { start: '2026-06-28', end: '2026-07-04', title: 'Prázdninový jezdecký kurz — 1. turnus', kind: 'pobyt' },
  { start: '2026-07-05', end: '2026-07-11', title: 'Prázdninový jezdecký kurz — 2. turnus', kind: 'pobyt' },
  { start: '2026-07-12', end: '2026-07-18', title: 'Prázdninový jezdecký kurz — 3. turnus', kind: 'pobyt' },
  { start: '2026-07-19', end: '2026-07-25', title: 'Prázdninový jezdecký kurz — 4. turnus', kind: 'pobyt' },

  { start: '2026-08-01', end: '2026-08-02', title: 'Amateur Jump Tour a Profi Jump Tour', kind: 'zavody' },
  { start: '2026-08-02', end: '2026-08-08', title: 'Prázdninový jezdecký kurz — 5. turnus', kind: 'pobyt' },
  { start: '2026-08-09', end: '2026-08-15', title: 'Prázdninový jezdecký kurz — 6. turnus', kind: 'pobyt' },
  { start: '2026-08-16', end: '2026-08-22', title: 'Prázdninový jezdecký kurz — 7. turnus', kind: 'pobyt' },
  { start: '2026-08-23', end: '2026-08-29', title: 'Prázdninový jezdecký kurz — 8. turnus', kind: 'pobyt' },
  { start: '2026-08-30', title: 'Srpnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },

  {
    start: '2026-09-03',
    end: '2026-09-06',
    title: 'Velká cena Litomyšle 2026',
    detail: 'Český skokový pohár — vrchol domácí sezóny',
    kind: 'vrchol',
    highlight: true,
  },
  { start: '2026-09-12', title: 'Zářijové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
  { start: '2026-09-19', title: 'Drezurní jezdecké závody', detail: 'hobby, Z–S', kind: 'drezura' },
  { start: '2026-09-20', title: 'Jezdecké hry pro děti — FINÁLE', detail: 'jízdy zručnosti, křížkový parkur, 40 a 60 cm', kind: 'hry', file: { label: 'Rozpis (DOC)', href: '/soubory/akce/rozpis-jezdecke-hry-2026-final.doc' } },
  { start: '2026-09-26', end: '2026-09-28', title: 'Podzimní závody ve všestrannosti + finále KMK', detail: 'pony, hobby, Z–ZL + parkury Z–ZL', kind: 'vsestrannost' },

  { start: '2026-10-04', title: 'Podzimní závody ve všestrannosti', detail: 'hobby, Z–ZL, pony', kind: 'vsestrannost' },
  { start: '2026-10-10', title: 'Říjnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
  { start: '2026-10-18', title: 'Závody spřežení — FINÁLE', kind: 'sprezeni' },
  { start: '2026-10-25', title: 'Podzimní naskladnění hřebečků v Pazuše', detail: 'do 12.00 hod', kind: 'chov' },
  { start: '2026-10-27', end: '2026-11-01', title: 'Podzimní pobyt s výukou jízdy na koni', detail: 'Po krůčcích k ZZVJ', kind: 'pobyt' },
  { start: '2026-10-28', title: 'Podzimní třídění hřebců', detail: 'od 10.00 hod', kind: 'chov' },

  { start: '2026-12-05', title: 'Mikulášská veselice pro děti', detail: 'jízdy zručnosti, parkur 40 a 60 cm', kind: 'hry' },

  // ---------------------------------------------------------------- 2025
  { start: '2025-05-08', title: 'Jarní třídění hřebců', kind: 'chov' },
  { start: '2025-06-06', title: 'Zkoušky hřebců', kind: 'chov' },
  { start: '2025-10-26', title: 'Naskladnění nového ročníku hřebečků', kind: 'chov' },
  { start: '2025-10-31', title: 'Podzimní třídění hřebců', kind: 'chov' },
];

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
 */
export function upcomingPublicEvents(now = new Date()): StableEvent[] {
  return upcomingEvents(now).filter((e) => e.kind !== 'pobyt');
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
