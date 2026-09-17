/**
 * Přihláška z formuláře: načtení a kontrola.
 *
 * Kontrola tady je kvůli srozumitelným chybám u jednotlivých polí.
 * Závazná pravidla (cena, povinné údaje, otevřený tábor) hlídá ještě
 * jednou databáze ve funkci `odeslat_prihlasku()`.
 */

import { dnesCz, platneDatum, posunDnu } from '@/lib/rezervace';
import type { Tabor } from './db';
import { vek } from './platba';

export const zkusenosti = [
  'Úplný začátečník (jízda na lonži)',
  'Mírně pokročilý (samostatně v kroku a klusu)',
  'Pokročilý (samostatně ve všech chodech)',
] as const;

export interface Vyplneno {
  token: string;
  tabor: string;
  varianta: string;
  priplatky: string[];
  dite_jmeno: string;
  dite_narozeni: string;
  dite_zkusenosti: string;
  dite_zdravi: string;
  dite_pojistovna: string;
  zastupce_jmeno: string;
  zastupce_email: string;
  zastupce_telefon: string;
  zastupce_adresa: string;
  platce: 'osoba' | 'firma';
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

export type Chyby = Partial<Record<keyof Vyplneno, string>>;

const text = (fd: FormData, klic: string, max: number) =>
  String(fd.get(klic) ?? '').trim().slice(0, max);

export function prazdnyFormular(tabor: Tabor): Vyplneno {
  return {
    token: crypto.randomUUID(),
    tabor: tabor.kod,
    varianta: tabor.varianty[0]?.kod ?? '',
    priplatky: [],
    dite_jmeno: '',
    dite_narozeni: '',
    dite_zkusenosti: '',
    dite_zdravi: '',
    dite_pojistovna: '',
    zastupce_jmeno: '',
    zastupce_email: '',
    zastupce_telefon: '',
    zastupce_adresa: '',
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

export function nactiFormular(fd: FormData, tabor: Tabor): Vyplneno {
  const platce = fd.get('platce') === 'firma' ? 'firma' : 'osoba';
  return {
    token: text(fd, 'token', 36),
    tabor: tabor.kod,
    varianta: text(fd, 'varianta', 60),
    priplatky: fd.getAll('priplatky').map((p) => String(p).slice(0, 60)),
    dite_jmeno: text(fd, 'dite_jmeno', 80),
    dite_narozeni: text(fd, 'dite_narozeni', 10),
    dite_zkusenosti: text(fd, 'dite_zkusenosti', 120),
    dite_zdravi: text(fd, 'dite_zdravi', 1000),
    dite_pojistovna: text(fd, 'dite_pojistovna', 60),
    zastupce_jmeno: text(fd, 'zastupce_jmeno', 80),
    zastupce_email: text(fd, 'zastupce_email', 120),
    zastupce_telefon: text(fd, 'zastupce_telefon', 30),
    zastupce_adresa: text(fd, 'zastupce_adresa', 200),
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

export function zkontroluj(v: Vyplneno, tabor: Tabor): Chyby {
  const chyby: Chyby = {};

  if (!tabor.varianty.some((x) => x.kod === v.varianta)) {
    chyby.varianta = 'Vyberte prosím variantu ceny.';
  }

  if (v.dite_jmeno.length < 3) chyby.dite_jmeno = 'Vyplňte prosím jméno a příjmení dítěte.';

  if (
    !platneDatum(v.dite_narozeni) ||
    v.dite_narozeni >= dnesCz() ||
    v.dite_narozeni < posunDnu(tabor.zacatek, -30 * 366)
  ) {
    chyby.dite_narozeni = 'Zadejte prosím platné datum narození.';
  } else if (tabor.vek_od && vek(v.dite_narozeni, tabor.zacatek) < tabor.vek_od) {
    chyby.dite_narozeni = `Tábor je pro děti od ${tabor.vek_od} let.`;
  }

  if (!v.dite_zkusenosti) chyby.dite_zkusenosti = 'Vyberte prosím jezdecké zkušenosti.';

  if (v.zastupce_jmeno.length < 3) chyby.zastupce_jmeno = 'Vyplňte prosím jméno a příjmení.';
  if (!EMAIL.test(v.zastupce_email)) chyby.zastupce_email = 'Zadejte prosím platný e-mail.';
  if (v.zastupce_telefon.replace(/\D/g, '').length < 9) {
    chyby.zastupce_telefon = 'Zadejte prosím telefon.';
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

  return chyby;
}
