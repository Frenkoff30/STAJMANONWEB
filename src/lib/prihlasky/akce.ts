/**
 * Zakládání a úprava akcí ve správě přihlášek.
 *
 * Akce určuje, jak bude vypadat formulář (typ), kolik lidí smí být na jedné
 * přihlášce a hlavně ceník, ze kterého databáze spočítá cenu. Proto se tu
 * kontroluje víc než obvykle: špatně zadaný ceník by se propsal do každé
 * přihlášky, která na akci přijde.
 *
 * Závazná pravidla hlídá ještě jednou databáze (`check` u tabulky `akce`),
 * tady jde o to říct člověku srozumitelně, co je špatně a u kterého pole.
 */

import { platneDatum } from '@/lib/rezervace';
import type { Akce, Polozka } from './db';
import { eventKindLabels, type EventKind } from '@/data/events';
import { typProDruh, type TypAkce } from './typy';

/** Kolik řádků ceníku formulář vykreslí. Prázdné se zahodí. */
export const RADKU_CENIKU = 8;

/** Pole akce, na která se dá pověsit chybová hláška. */
export type ChybyAkce = Partial<Record<keyof VyplnenaAkce, string>>;
/** Chyby v ceníku: seznam → index řádku → hláška. */
export type ChybyCeniku = Record<'varianty' | 'priplatky', Record<number, string>>;

export interface VyplnenaAkce extends Omit<Akce, 'varianty' | 'priplatky'> {
  varianty: Polozka[];
  priplatky: Polozka[];
}

const text = (fd: FormData, klic: string, max: number) =>
  String(fd.get(klic) ?? '').trim().slice(0, max);

const cislo = (fd: FormData, klic: string, vychozi: number) => {
  // Pozor na `Number('')`, to je nula. Nevyplněné pole musí zůstat
  // nevyplněné, jinak by se z chybějící ceny stala položka zdarma.
  const surove = String(fd.get(klic) ?? '').replace(/\s/g, '');
  if (surove === '') return vychozi;
  const hodnota = Number(surove);
  return Number.isFinite(hodnota) ? Math.trunc(hodnota) : vychozi;
};

/* ------------------------------------------------------------------- kód */

/**
 * Z názvu a roku udělá kód do adresy: „Letní jezdecký tábor" + 2027
 * → `letni-jezdecky-tabor-2027`. Kód je zároveň adresa přihlášky, takže
 * musí být bez diakritiky a mezer.
 */
export function kodZNazvu(nazev: string, datum: string): string {
  const rok = /^\d{4}/.exec(datum)?.[0] ?? '';
  const zaklad = nazev
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '');
  return [zaklad, rok].filter(Boolean).join('-').slice(0, 60);
}

/* ---------------------------------------------------------------- prázdná */

export interface VychoziProTyp {
  max_ucastniku: number;
  vyber: 'jedna' | 'vice';
  splatnost_dni: number;
  platba_hned: boolean;
}

/**
 * Co se u kterého typu obvykle nastavuje. Startovné se platí rovnou,
 * tábor a pobyt až po potvrzení místa. Klub přihlašuje celou skupinu,
 * rodič jedno dítě.
 *
 * Stejnou tabulku používá i skript ve formuláři, aby se při přepnutí typu
 * změnila i pole, kterých se nikdo nedotkl.
 */
export const vychoziProTyp: Record<TypAkce, VychoziProTyp> = {
  tabor: { max_ucastniku: 1, vyber: 'jedna', splatnost_dni: 30, platba_hned: false },
  pobyt: { max_ucastniku: 1, vyber: 'jedna', splatnost_dni: 30, platba_hned: false },
  hry: { max_ucastniku: 10, vyber: 'vice', splatnost_dni: 0, platba_hned: true },
  soustredeni: { max_ucastniku: 10, vyber: 'jedna', splatnost_dni: 0, platba_hned: true },
  zavody: { max_ucastniku: 10, vyber: 'vice', splatnost_dni: 0, platba_hned: true },
};

/** Nová akce: rozumné výchozí hodnoty podle druhu, ať je co ukázat. */
export function prazdnaAkce(druh: EventKind = 'zavody'): VyplnenaAkce {
  const platnyDruh = druh in eventKindLabels ? druh : 'zavody';
  const typ = typProDruh[platnyDruh];
  const vychozi = vychoziProTyp[typ];

  return {
    kod: '',
    druh: platnyDruh,
    typ,
    nazev: '',
    podtitul: '',
    popis: '',
    zacatek: '',
    konec: '',
    nastup: '',
    odjezd: '',
    vek_od: null,
    kapacita: 0,
    ...vychozi,
    varianty: [],
    priplatky: [],
    otevreno: true,
    // Nová akce je napřed jen v kalendáři, přihlašování se zapne zaškrtnutím.
    prihlasovani: false,
    zvyraznit: false,
    rozpis_nazev: '',
    rozpis_url: '',
  };
}

/* ------------------------------------------------------------------ čtení */

/** Jeden řádek ceníku z formuláře. Kód se doplní z názvu, když chybí. */
function nactiPolozky(fd: FormData, seznam: 'varianty' | 'priplatky'): Polozka[] {
  const out: Polozka[] = [];

  for (let i = 0; i < RADKU_CENIKU; i++) {
    const nazev = text(fd, `${seznam}[${i}].nazev`, 120);
    const popis = text(fd, `${seznam}[${i}].popis`, 300);
    const surovyKod = text(fd, `${seznam}[${i}].kod`, 40);
    const surovaCena = text(fd, `${seznam}[${i}].cena`, 12);

    // Řádek, do kterého nikdo nic nenapsal, do ceníku nepatří.
    if (!nazev && !popis && !surovyKod && !surovaCena) continue;

    out.push({
      kod: surovyKod || kodZNazvu(nazev, '').slice(0, 40),
      nazev,
      popis,
      cena: cislo(fd, `${seznam}[${i}].cena`, -1),
    });
  }

  return out;
}

/**
 * Akce z formuláře. Rozpis ke stažení se tu nečte — soubor nahrává
 * stránka sama a výsledek doplní do `rozpis_*`.
 */
export function nactiAkci(fd: FormData): VyplnenaAkce {
  const surovyDruh = String(fd.get('druh') ?? '') as EventKind;
  const druh: EventKind = surovyDruh in eventKindLabels ? surovyDruh : 'jina';
  const zacatek = text(fd, 'zacatek', 10);
  const nazev = text(fd, 'nazev', 120);
  const vekOd = text(fd, 'vek_od', 3);

  return {
    kod: text(fd, 'kod', 60).toLowerCase() || kodZNazvu(nazev, zacatek),
    druh,
    typ: typProDruh[druh],
    nazev,
    podtitul: text(fd, 'podtitul', 160),
    popis: text(fd, 'popis', 2000),
    zacatek,
    // Jednodenní akce mají konec stejný jako začátek, ať se nemusí vyplňovat.
    konec: text(fd, 'konec', 10) || zacatek,
    nastup: text(fd, 'nastup', 120),
    odjezd: text(fd, 'odjezd', 120),
    vek_od: vekOd === '' ? null : cislo(fd, 'vek_od', 0),
    kapacita: cislo(fd, 'kapacita', 0),
    max_ucastniku: cislo(fd, 'max_ucastniku', 1),
    vyber: fd.get('vyber') === 'vice' ? 'vice' : 'jedna',
    splatnost_dni: cislo(fd, 'splatnost_dni', 0),
    platba_hned: fd.get('platba_hned') === 'ano',
    varianty: nactiPolozky(fd, 'varianty'),
    priplatky: nactiPolozky(fd, 'priplatky'),
    otevreno: fd.get('otevreno') === 'ano',
    prihlasovani: fd.get('prihlasovani') === 'ano',
    zvyraznit: fd.get('zvyraznit') === 'ano',
    rozpis_nazev: '',
    rozpis_url: '',
  };
}

/* --------------------------------------------------------------- kontrola */

/** Ceník: názvy a ceny musí dávat smysl a kódy se nesmí opakovat. */
function zkontrolujCenik(
  polozky: Polozka[],
  seznam: 'varianty' | 'priplatky',
  chyby: ChybyCeniku,
): void {
  const videne = new Set<string>();

  polozky.forEach((p, i) => {
    if (!p.nazev) {
      chyby[seznam][i] = 'Doplňte název položky.';
    } else if (!Number.isInteger(p.cena) || p.cena < 0) {
      chyby[seznam][i] = 'Doplňte cenu. Položka zdarma má cenu 0.';
    } else if (p.cena > 999999) {
      chyby[seznam][i] = 'Cena je podezřele vysoká, zkontrolujte ji.';
    } else if (!/^[a-z0-9-]{1,40}$/.test(p.kod)) {
      chyby[seznam][i] = 'Kód smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky.';
    } else if (videne.has(p.kod)) {
      chyby[seznam][i] = `Kód „${p.kod}" už v ceníku je, každá položka musí mít vlastní.`;
    } else {
      videne.add(p.kod);
    }
  });
}

export function zkontrolujAkci(a: VyplnenaAkce): {
  chyby: ChybyAkce;
  cenik: ChybyCeniku;
} {
  const chyby: ChybyAkce = {};
  const cenik: ChybyCeniku = { varianty: {}, priplatky: {} };

  if (!a.nazev) chyby.nazev = 'Bez názvu se akce neobejde.';

  if (!/^[a-z0-9-]{3,60}$/.test(a.kod)) {
    chyby.kod =
      'Adresa smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky, nejméně tři znaky.';
  }

  if (!platneDatum(a.zacatek)) {
    chyby.zacatek = 'Vyplňte datum začátku.';
  } else if (!platneDatum(a.konec)) {
    chyby.konec = 'Datum konce není platné.';
  } else if (a.konec < a.zacatek) {
    chyby.konec = 'Konec nemůže být dřív než začátek.';
  }

  // Akce jen do kalendáře: ceník a nastavení přihlášek se nekontroluje,
  // stejně se nepoužijí.
  if (!a.prihlasovani) return { chyby, cenik };

  if (a.vek_od !== null && (a.vek_od < 0 || a.vek_od > 99)) {
    chyby.vek_od = 'Věk zadejte mezi 0 a 99, nebo nechte prázdné.';
  }

  if (a.kapacita < 0) chyby.kapacita = 'Kapacita nemůže být záporná.';

  if (a.max_ucastniku < 1 || a.max_ucastniku > 40) {
    chyby.max_ucastniku = 'Na jedné přihlášce smí být 1 až 40 účastníků.';
  }

  if (a.splatnost_dni < 0 || a.splatnost_dni > 365) {
    chyby.splatnost_dni = 'Splatnost zadejte ve dnech, 0 až 365.';
  }

  // Bez ceníku by databáze spočítala nulu a přihláška by přišla zadarmo.
  if (a.varianty.length === 0) {
    chyby.varianty = 'Doplňte aspoň jednu položku ceníku, z ní se počítá cena.';
  }

  zkontrolujCenik(a.varianty, 'varianty', cenik);
  zkontrolujCenik(a.priplatky, 'priplatky', cenik);

  return { chyby, cenik };
}

/** Je ve výsledku kontroly aspoň jedna chyba? */
export function jsouChyby(v: { chyby: ChybyAkce; cenik: ChybyCeniku }): boolean {
  return (
    Object.keys(v.chyby).length > 0 ||
    Object.keys(v.cenik.varianty).length > 0 ||
    Object.keys(v.cenik.priplatky).length > 0
  );
}

/** Akce připravená k zápisu do databáze. Prázdný `vek_od` jde jako null. */
export function proDatabazi(a: VyplnenaAkce): Record<string, unknown> {
  return {
    kod: a.kod,
    druh: a.druh,
    typ: a.typ,
    nazev: a.nazev,
    podtitul: a.podtitul,
    popis: a.popis,
    zacatek: a.zacatek,
    konec: a.konec,
    nastup: a.nastup,
    odjezd: a.odjezd,
    vek_od: a.vek_od,
    kapacita: a.kapacita,
    max_ucastniku: a.max_ucastniku,
    vyber: a.vyber,
    splatnost_dni: a.splatnost_dni,
    platba_hned: a.platba_hned,
    varianty: a.varianty,
    priplatky: a.priplatky,
    // Bez online přihlašování musí zůstat zavřeno, jinak by šla přihláška
    // odeslat přímo přes adresu.
    otevreno: a.prihlasovani && a.otevreno,
    prihlasovani: a.prihlasovani,
    zvyraznit: a.zvyraznit,
    rozpis_nazev: a.rozpis_nazev,
    rozpis_url: a.rozpis_url,
  };
}

/** Řádky ceníku pro vykreslení: vyplněné napřed, zbytek prázdný. */
export function radkyCeniku(polozky: Polozka[]): (Polozka | null)[] {
  const out: (Polozka | null)[] = [...polozky.slice(0, RADKU_CENIKU)];
  while (out.length < RADKU_CENIKU) out.push(null);
  return out;
}
