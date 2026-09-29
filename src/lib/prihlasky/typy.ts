/**
 * Typy akcí a jejich formuláře.
 *
 * Tábor se ptá na dítě a zákonného zástupce, jezdecké hry na klub a jeho
 * jezdce, soustředění na jezdce a koně. Aby kvůli tomu nemusel existovat
 * pět různých stránek, drží se rozdíly na jednom místě tady: co se ptát
 * účastníka, jak mu říkat a kolik jich smí být na jedné přihlášce.
 *
 * Kolik účastníků jde přidat a jestli se z ceníku vybírá jedna položka
 * nebo několik, určuje sama akce v databázi (`max_ucastniku`, `vyber`) —
 * tady je jen to, co se nedá vyčíst z ceníku.
 */

export type TypAkce = 'tabor' | 'pobyt' | 'hry' | 'soustredeni' | 'zavody';

/** Pole, na která se dá ptát u jednoho účastníka. */
export type PoleUcastnika =
  | 'narozeni'
  | 'kun'
  | 'zkusenosti'
  | 'uroven'
  | 'licence'
  | 'pojistovna'
  | 'zdravi';

export interface PopisTypu {
  /** Jak se typu říká ve výpisech. */
  nazev: string;
  /** Jeden účastník: „Dítě“, „Jezdec“. */
  ucastnik: string;
  /** Víc účastníků: „Děti“, „Jezdci“. */
  ucastnici: string;
  /** Text tlačítka, kterým se přidává další řádek. */
  pridat: string;
  /** Nadpis sekce s kontaktem. */
  kontakt: string;
  /** Věta pod nadpisem kontaktu. */
  kontaktPopis: string;
  /** Popisek pole pro klub nebo stáj. Prázdné = na subjekt se neptáme. */
  subjekt: string;
  /** Nápověda k poli subjektu. */
  subjektPopis: string;
  /** Bez klubu nebo stáje přihlášku neodešleme (ani jednotlivce). */
  subjektPovinny?: boolean;
  /** Na co se ptáme u účastníka, v pořadí, v jakém se to vykreslí. */
  pola: PoleUcastnika[];
  /** Podmnožina `pola`, bez které přihlášku neodešleme. */
  povinna: PoleUcastnika[];
  /** Nadpis sekce s ceníkem. */
  cenik: string;
  /** Nadpis sekce s příplatky. */
  priplatky: string;
  /** Co se píše u souhlasu s fotkami. */
  souhlasFoto: string;
  /** Věta v potvrzení po odeslání. */
  potvrzeni: string;
}

const SPOLECNE = {
  priplatky: 'Příplatky',
  souhlasFoto:
    'Fotky z akce, na kterých je účastník, smíte zveřejnit na webu a sociálních sítích stáje.',
} as const;

export const typyAkci: Record<TypAkce, PopisTypu> = {
  tabor: {
    ...SPOLECNE,
    nazev: 'Tábor',
    ucastnik: 'Dítě',
    ucastnici: 'Děti',
    pridat: 'Přihlásit další dítě',
    kontakt: 'Zákonný zástupce',
    kontaktPopis: 'Sem pošleme potvrzení a platební údaje.',
    subjekt: '',
    subjektPopis: '',
    pola: ['narozeni', 'zkusenosti', 'pojistovna', 'zdravi'],
    povinna: ['narozeni', 'zkusenosti'],
    cenik: 'Cena',
    souhlasFoto:
      'Fotky z tábora, na kterých je dítě, smíte zveřejnit na webu a sociálních sítích stáje.',
    potvrzeni:
      'Teď ji projdeme a do několika dnů vám potvrdíme místo. Platební údaje přijdou spolu s potvrzením, zatím nic neplaťte.',
  },

  pobyt: {
    ...SPOLECNE,
    nazev: 'Pobyt s výukou',
    ucastnik: 'Dítě',
    ucastnici: 'Děti',
    pridat: 'Přihlásit další dítě',
    kontakt: 'Zákonný zástupce',
    kontaktPopis: 'Sem pošleme potvrzení a platební údaje.',
    subjekt: '',
    subjektPopis: '',
    pola: ['narozeni', 'zkusenosti', 'pojistovna', 'zdravi'],
    povinna: ['narozeni', 'zkusenosti'],
    cenik: 'Cena',
    souhlasFoto:
      'Fotky z pobytu, na kterých je dítě, smíte zveřejnit na webu a sociálních sítích stáje.',
    potvrzeni:
      'Teď ji projdeme a do několika dnů vám potvrdíme místo. Platební údaje přijdou spolu s potvrzením, zatím nic neplaťte.',
  },

  /* Hry: přihlašuje je vedoucí klubu za celou skupinu dvojic. */
  hry: {
    ...SPOLECNE,
    nazev: 'Jezdecké hry',
    ucastnik: 'Dvojice',
    ucastnici: 'Jezdci a koně',
    pridat: 'Přidat další dvojici',
    kontakt: 'Kontaktní osoba',
    kontaktPopis: 'Komu volat kvůli startovní listině a případným změnám.',
    subjekt: 'Klub nebo stáj',
    subjektPopis:
      'Jak se má vypsat ve startovní listině. Jednotlivci napíšou stáj nebo klub, kde jezdí.',
    subjektPovinny: true,
    pola: ['kun', 'narozeni'],
    povinna: ['kun'],
    cenik: 'Soutěže a startovné',
    potvrzeni:
      'Startovní listinu sestavíme podle pořadí přihlášek a vyvěsíme ji před akcí. Startovné je splatné před startem, platební údaje jsou níže.',
  },

  soustredeni: {
    ...SPOLECNE,
    nazev: 'Soustředění',
    ucastnik: 'Dvojice',
    ucastnici: 'Jezdci a koně',
    pridat: 'Přidat další dvojici',
    kontakt: 'Kontaktní osoba',
    kontaktPopis: 'Sem pošleme rozdělení do skupin a časy tréninků.',
    subjekt: 'Klub nebo stáj',
    subjektPopis: 'Nepovinné.',
    pola: ['kun', 'uroven', 'narozeni'],
    povinna: ['kun', 'uroven'],
    cenik: 'Rozsah a cena',
    potvrzeni:
      'Do skupin rozdělujeme podle výkonnosti, rozpis pošleme pár dnů předem. Platební údaje jsou níže.',
  },

  zavody: {
    ...SPOLECNE,
    nazev: 'Závody a veřejné tréninky',
    ucastnik: 'Dvojice',
    ucastnici: 'Jezdci a koně',
    pridat: 'Přidat další dvojici',
    kontakt: 'Kontaktní osoba',
    kontaktPopis: 'Komu volat kvůli startovní listině a případným změnám.',
    subjekt: 'Klub nebo stáj',
    subjektPopis: 'Jak se má stáj vypsat ve startovní listině.',
    pola: ['kun', 'licence'],
    povinna: ['kun'],
    cenik: 'Soutěže a startovné',
    potvrzeni:
      'Startovní listinu sestavíme podle pořadí přihlášek a vyvěsíme ji před akcí. Startovné je splatné před startem, platební údaje jsou níže.',
  },
};

export function popisTypu(typ: string | null | undefined): PopisTypu {
  return typyAkci[(typ ?? 'tabor') as TypAkce] ?? typyAkci.tabor;
}

/* --------------------------------------------------------------- číselníky */

export const zkusenosti = [
  'Úplný začátečník (jízda na lonži)',
  'Mírně pokročilý (samostatně v kroku a klusu)',
  'Pokročilý (samostatně ve všech chodech)',
] as const;

export const urovne = [
  'Začínáme se skákáním',
  'Křížky a parkury do 80 cm',
  'Stupeň Z a ZL',
  'Stupeň L a vyšší',
] as const;

/** Popisky a nápovědy jednotlivých polí účastníka. */
export const polaUcastnika: Record<
  PoleUcastnika,
  { label: string; napoveda?: string; sirka?: 'plna' }
> = {
  narozeni: { label: 'Datum narození' },
  kun: { label: 'Jméno koně' },
  zkusenosti: { label: 'Jezdecké zkušenosti' },
  uroven: { label: 'Dosavadní výkonnost' },
  licence: { label: 'Číslo licence ČJF', napoveda: 'Hobby dvojice nechají prázdné.' },
  pojistovna: { label: 'Zdravotní pojišťovna' },
  zdravi: {
    label: 'Zdravotní omezení, alergie, léky',
    napoveda: 'Vidí jen vedoucí akce. Když nic, nechte prázdné.',
    sirka: 'plna',
  },
};

/* ------------------------------------------------------------------ čeština */

/**
 * Skloňování počtu ve 4. pádě: „přidat 1 účastníka / 2 účastníky /
 * 5 účastníků“. Čeština má tři tvary, `Intl.PluralRules` je zná.
 */
const pluralCz = new Intl.PluralRules('cs-CZ');

export function pocetUcastniku(n: number): string {
  const tvar = pluralCz.select(n);
  const slovo = tvar === 'one' ? 'účastníka' : tvar === 'few' ? 'účastníky' : 'účastníků';
  return `${n} ${slovo}`;
}
