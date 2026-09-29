/**
 * Přihláška z formuláře: načtení a kontrola.
 *
 * Formulář má proměnný počet účastníků — rodič přihlašuje jedno dítě,
 * klub klidně dvacet dvojic. Řádky se vykreslí všechny najednou (kolik
 * akce dovolí) a bez JavaScriptu se prostě nechají prázdné; JavaScript
 * je jen schovává a odkrývá tlačítkem. Pole se jmenují
 * `ucastnik[0].jmeno` a při načtení se zase složí do seznamu.
 *
 * Kontrola tady je kvůli srozumitelným chybám u jednotlivých polí.
 * Závazná pravidla (cena, povinné údaje, otevřená akce) hlídá ještě
 * jednou databáze ve funkci `odeslat_prihlasku()`.
 */

import { dnesCz, platneDatum, posunDnu } from '@/lib/rezervace';
import type { Akce } from './db';
import { vek } from './platba';
import { pocetUcastniku, popisTypu, type PoleUcastnika } from './typy';

export { zkusenosti, urovne } from './typy';

export interface VyplnenyUcastnik {
  jmeno: string;
  narozeni: string;
  kun: string;
  zkusenosti: string;
  uroven: string;
  licence: string;
  pojistovna: string;
  zdravi: string;
  /** Kódy vybraných položek ceníku. */
  varianty: string[];
  priplatky: string[];
}

export interface Vyplneno {
  token: string;
  akce: string;
  subjekt: string;
  ucastnici: VyplnenyUcastnik[];
  kontakt_jmeno: string;
  kontakt_email: string;
  kontakt_telefon: string;
  kontakt_adresa: string;
  platce: 'osoba' | 'firma' | 'misto';
  firma_ico: string;
  firma_nazev: string;
  firma_adresa: string;
  firma_dic: string;
  firma_email: string;
  firma_objednavka: string;
  poznamka: string;
  souhlas_podminky: boolean;
  souhlas_foto: boolean;
}

/** Chyby u polí přihlášky. */
export type Chyby = Partial<Record<keyof Vyplneno, string>>;
/** Chyby u jednotlivých účastníků: index řádku → pole → hláška. */
export type ChybyUcastniku = Record<number, Partial<Record<keyof VyplnenyUcastnik, string>>>;

const text = (fd: FormData, klic: string, max: number) =>
  String(fd.get(klic) ?? '').trim().slice(0, max);

/** Úplně prázdný řádek — nic předvybraného. */
export function prazdnyRadek(): VyplnenyUcastnik {
  return {
    jmeno: '',
    narozeni: '',
    kun: '',
    zkusenosti: '',
    uroven: '',
    licence: '',
    pojistovna: '',
    zdravi: '',
    varianty: [],
    priplatky: [],
  };
}

export function prazdnyUcastnik(akce: Akce): VyplnenyUcastnik {
  return {
    jmeno: '',
    narozeni: '',
    kun: '',
    zkusenosti: '',
    uroven: '',
    licence: '',
    pojistovna: '',
    zdravi: '',
    // U jedné povinné položky je první z ceníku předvybraná, u výběru
    // z více soutěží začínáme prázdní — ať si klub vybere sám.
    varianty: akce.vyber === 'jedna' && akce.varianty[0] ? [akce.varianty[0].kod] : [],
    priplatky: [],
  };
}

/**
 * Prázdný formulář: tolik řádků, kolik akce dovolí. První má předvybranou
 * cenu, ostatní zůstanou prázdné, aby šly poznat jako nevyplněné.
 */
export function prazdnyFormular(akce: Akce): Vyplneno {
  const ucastnici = Array.from({ length: akce.max_ucastniku }, (_, i) =>
    i === 0 ? prazdnyUcastnik(akce) : prazdnyRadek(),
  );

  return {
    token: crypto.randomUUID(),
    akce: akce.kod,
    subjekt: '',
    ucastnici,
    kontakt_jmeno: '',
    kontakt_email: '',
    kontakt_telefon: '',
    kontakt_adresa: '',
    platce: 'osoba',
    firma_ico: '',
    firma_nazev: '',
    firma_adresa: '',
    firma_dic: '',
    firma_email: '',
    firma_objednavka: '',
    poznamka: '',
    souhlas_podminky: false,
    souhlas_foto: false,
  };
}

/** Řádek, do kterého nikdo nic nenapsal, se do přihlášky nepočítá. */
export function prazdny(u: VyplnenyUcastnik): boolean {
  return (
    !u.jmeno &&
    !u.narozeni &&
    !u.kun &&
    !u.zkusenosti &&
    !u.uroven &&
    !u.licence &&
    !u.pojistovna &&
    !u.zdravi &&
    u.varianty.length === 0 &&
    u.priplatky.length === 0
  );
}

export function nactiFormular(fd: FormData, akce: Akce): Vyplneno {
  const volba = fd.get('platce');
  const platce = volba === 'firma' || volba === 'misto' ? volba : 'osoba';

  const ucastnici: VyplnenyUcastnik[] = [];
  for (let i = 0; i < akce.max_ucastniku; i++) {
    const u = (klic: string, max: number) => text(fd, `ucastnik[${i}].${klic}`, max);
    ucastnici.push({
      jmeno: u('jmeno', 80),
      narozeni: u('narozeni', 10),
      kun: u('kun', 80),
      zkusenosti: u('zkusenosti', 120),
      uroven: u('uroven', 120),
      licence: u('licence', 40),
      pojistovna: u('pojistovna', 60),
      zdravi: u('zdravi', 1000),
      varianty: fd.getAll(`ucastnik[${i}].varianty`).map((x) => String(x).slice(0, 60)),
      priplatky: fd.getAll(`ucastnik[${i}].priplatky`).map((x) => String(x).slice(0, 60)),
    });
  }

  // Prázdné řádky zahodíme, ale aspoň jeden musí zůstat, ať je co
  // vykreslit a na co navěsit chybu.
  const vyplnene = ucastnici.filter((u) => !prazdny(u));

  return {
    token: text(fd, 'token', 36),
    akce: akce.kod,
    subjekt: text(fd, 'subjekt', 120),
    ucastnici: vyplnene.length > 0 ? vyplnene : ucastnici.slice(0, 1),
    kontakt_jmeno: text(fd, 'kontakt_jmeno', 80),
    kontakt_email: text(fd, 'kontakt_email', 120),
    kontakt_telefon: text(fd, 'kontakt_telefon', 30),
    kontakt_adresa: text(fd, 'kontakt_adresa', 200),
    platce,
    firma_ico: text(fd, 'firma_ico', 12).replace(/\s/g, ''),
    firma_nazev: text(fd, 'firma_nazev', 160),
    firma_adresa: text(fd, 'firma_adresa', 200),
    firma_dic: text(fd, 'firma_dic', 14).replace(/\s/g, '').toUpperCase(),
    firma_email: text(fd, 'firma_email', 120),
    firma_objednavka: text(fd, 'firma_objednavka', 60),
    poznamka: text(fd, 'poznamka', 1000),
    souhlas_podminky: fd.get('souhlas_podminky') === 'ano',
    souhlas_foto: fd.get('souhlas_foto') === 'ano',
  };
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** IČO: 8 číslic a sedí kontrolní číslice. */
export function platneIco(ico: string): boolean {
  if (!/^\d{8}$/.test(ico)) return false;
  const soucet = [...ico.slice(0, 7)].reduce((s, c, i) => s + Number(c) * (8 - i), 0);
  return (11 - (soucet % 11)) % 10 === Number(ico[7]);
}

/** Kontrola jednoho řádku účastníka podle toho, na co se typ akce ptá. */
function zkontrolujUcastnika(
  u: VyplnenyUcastnik,
  akce: Akce,
): Partial<Record<keyof VyplnenyUcastnik, string>> {
  const typ = popisTypu(akce.typ);
  const chyby: Partial<Record<keyof VyplnenyUcastnik, string>> = {};
  const povinne = (p: PoleUcastnika) => typ.povinna.includes(p);

  if (u.jmeno.length < 3) chyby.jmeno = 'Vyplňte prosím jméno a příjmení.';

  if (typ.pola.includes('narozeni')) {
    if (!u.narozeni) {
      if (povinne('narozeni')) chyby.narozeni = 'Vyplňte prosím datum narození.';
    } else if (
      !platneDatum(u.narozeni) ||
      u.narozeni >= dnesCz() ||
      u.narozeni < posunDnu(akce.zacatek, -100 * 366)
    ) {
      chyby.narozeni = 'Zadejte prosím platné datum narození.';
    } else if (akce.vek_od && vek(u.narozeni, akce.zacatek) < akce.vek_od) {
      chyby.narozeni = `Akce je pro děti od ${akce.vek_od} let.`;
    }
  }

  if (povinne('kun') && !u.kun) chyby.kun = 'Vyplňte prosím jméno koně.';
  if (povinne('zkusenosti') && !u.zkusenosti) {
    chyby.zkusenosti = 'Vyberte prosím jezdecké zkušenosti.';
  }
  if (povinne('uroven') && !u.uroven) chyby.uroven = 'Vyberte prosím dosavadní výkonnost.';
  if (povinne('licence') && !u.licence) chyby.licence = 'Vyplňte prosím číslo licence.';

  const znameVarianty = new Set(akce.varianty.map((v) => v.kod));
  const vybrane = u.varianty.filter((v) => znameVarianty.has(v));

  if (vybrane.length === 0) {
    chyby.varianty =
      akce.vyber === 'jedna'
        ? 'Vyberte prosím variantu ceny.'
        : 'Vyberte prosím aspoň jednu soutěž.';
  } else if (akce.vyber === 'jedna' && vybrane.length > 1) {
    chyby.varianty = 'Vyberte prosím jen jednu variantu.';
  }

  return chyby;
}

export function zkontroluj(
  v: Vyplneno,
  akce: Akce,
): { chyby: Chyby; ucastnici: ChybyUcastniku } {
  const chyby: Chyby = {};
  const ucastnici: ChybyUcastniku = {};

  if (popisTypu(akce.typ).subjektPovinny && v.subjekt.length < 2) {
    chyby.subjekt = 'Vyplňte prosím klub nebo stáj.';
  }

  if (v.ucastnici.length === 0) {
    chyby.ucastnici = 'Přidejte prosím aspoň jednoho účastníka.';
  } else if (v.ucastnici.length > akce.max_ucastniku) {
    chyby.ucastnici = `Na jednu přihlášku jde přidat nejvýš ${pocetUcastniku(akce.max_ucastniku)}.`;
  }

  v.ucastnici.forEach((u, i) => {
    const jeho = zkontrolujUcastnika(u, akce);
    if (Object.keys(jeho).length > 0) ucastnici[i] = jeho;
  });

  if (v.kontakt_jmeno.length < 3) chyby.kontakt_jmeno = 'Vyplňte prosím jméno a příjmení.';
  if (!EMAIL.test(v.kontakt_email)) chyby.kontakt_email = 'Zadejte prosím platný e-mail.';
  if (v.kontakt_telefon.replace(/\D/g, '').length < 9) {
    chyby.kontakt_telefon = 'Zadejte prosím telefon.';
  }

  if (v.platce === 'firma') {
    if (!platneIco(v.firma_ico)) chyby.firma_ico = 'Tohle IČO neexistuje, zkontrolujte ho prosím.';
    if (v.firma_nazev.length < 2) chyby.firma_nazev = 'Vyplňte prosím název firmy.';
    if (v.firma_adresa.length < 5) chyby.firma_adresa = 'Vyplňte prosím sídlo firmy.';
    if (!EMAIL.test(v.firma_email)) chyby.firma_email = 'Zadejte prosím e-mail pro fakturu.';
  }

  if (!v.souhlas_podminky) {
    chyby.souhlas_podminky = 'Bez souhlasu s podmínkami přihlášku odeslat nejde.';
  }

  return { chyby, ucastnici };
}

/** Je v přihlášce vůbec nějaká chyba? */
export function jsouChyby(v: { chyby: Chyby; ucastnici: ChybyUcastniku }): boolean {
  return Object.keys(v.chyby).length > 0 || Object.keys(v.ucastnici).length > 0;
}
