/**
 * Prázdninové jezdecké kurzy — turnusy a ceník.
 * Obsazenost se mění nejčastěji: stačí přepsat `status` a `note`.
 */

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

export const turnusy: Turnus[] = [
  { n: 1, start: '2026-06-28', end: '2026-07-04', status: 'uzavreno' },
  {
    n: 2,
    start: '2026-07-05',
    end: '2026-07-11',
    status: 'posledni',
    note: '2 místa + 2 místa s vlastním koněm',
  },
  { n: 3, start: '2026-07-12', end: '2026-07-18', status: 'obsazeno' },
  { n: 4, start: '2026-07-19', end: '2026-07-25', status: 'volno' },
  {
    n: 5,
    start: '2026-08-02',
    end: '2026-08-08',
    status: 'posledni',
    note: '2 místa + 1 místo s vlastním koněm',
  },
  {
    n: 6,
    start: '2026-08-09',
    end: '2026-08-15',
    status: 'posledni',
    note: '2 místa + 2 místa s vlastním koněm + 1 místo na lonž',
  },
  {
    n: 7,
    start: '2026-08-16',
    end: '2026-08-22',
    status: 'posledni',
    note: '2 místa na lonž',
  },
  { n: 8, start: '2026-08-23', end: '2026-08-29', status: 'uzavreno' },
];

export const kurzCena = {
  main: '11 400 Kč',
  discounted: '10 900 Kč',
  discountNote:
    'pokoj s palandami, děti do 10 let včetně, úplní začátečníci a členové JKHS',
  ownHorse: '+ 1 000 Kč',
  account: '86-5310227/0100',
};

export const kurzProgram = [
  {
    title: 'Jízda na koni',
    text: '6 výukových lekcí zaměřených na sed jezdce, rovnováhu a správné působení na koně. Pokročilí se seznámí se základy práce na dvou stopách. Vybrané lekce nahráváme na video.',
  },
  {
    title: 'Teorie 2× denně',
    text: 'Výuka ve skupinách podle okruhů ZZVJ — bezpečnost, ošetřování a péče o koně, základy chovu, pravidla jezdeckých soutěží.',
  },
  {
    title: 'Ubytování a strava',
    text: 'Třílůžkové pokoje s vlastní koupelnou a WC, jeden čtyřlůžkový s palandami. Stravování 5× denně v restauraci s letní terasou, pitný režim po celý den.',
  },
  {
    title: 'Volný čas',
    text: 'Sportovní a společenské hry, výlety, tvoření. Kdo chce spát venku, ať si přiveze karimatku a spacák.',
  },
];

export const kurzIncluded = [
  'celodenní strava včetně pitného režimu',
  'ubytování na pokoji s vlastním sociálním zařízením',
  'jezdecký výcvik s cvičiteli',
  'využití kryté haly a kolbiště včetně jízdárenského materiálu',
  'organizovaný program s instruktory a celodenní dozor',
  'vstupenky a doprava na výlety',
  'ceny do soutěží',
];

export const kurzPacking = [
  'jezdecká přilba (tříbodová)',
  'bezpečnostní jezdecká vesta',
  'rajtky nebo vhodné kalhoty na ježdění',
  'perka, chapsy nebo jezdecké boty, bičík',
  'oblečení na teplo i na zimu, pláštěnka, gumáky',
  'hygienické potřeby, ručník, přezůvky, plavky',
  'kšiltovka, opalovací krém',
  'psací potřeby, zápisník, hrnek na čaj',
  'odměny pro koně, gumičky na zaplétání',
  'kopie kartičky pojišťovny',
  'potvrzení o bezinfekčnosti ne starší 3 dnů',
];

export const stornoPodminky = [
  { when: '14–7 dní před nástupem', fee: '50 % z celkové ceny' },
  { when: '6–3 dny před nástupem', fee: '80 % z celkové ceny' },
  {
    when: '2–1 den před nástupem nebo předčasné ukončení',
    fee: '100 % z celkové ceny',
  },
];
