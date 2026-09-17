/**
 * Peníze u přihlášek: částky, splatnost a QR Platba.
 *
 * QR kód je český standard SPAYD (QR Platba), který umí naskenovat
 * každá mobilní banka v Česku. Obsahuje jen účet stáje, částku,
 * variabilní symbol a splatnost, žádné osobní údaje.
 */

import QRCode from 'qrcode';
import { site } from '@/data/site';
import { formatRange } from '@/data/events';
import { dnesCz, posunDnu } from '@/lib/rezervace';
import type { Polozka, Tabor } from './db';

/** `11400` → `11 400 Kč` (s nezlomitelnou mezerou). */
export function kc(castka: number): string {
  return `${castka.toLocaleString('cs-CZ')} Kč`;
}

/** `4.–10. července 2027` */
export function terminTaboru(tabor: Pick<Tabor, 'zacatek' | 'konec'>): string {
  return formatRange({ start: tabor.zacatek, end: tabor.konec, title: '', kind: 'pobyt' });
}

/** Věk v celých letech k danému dni. */
export function vek(narozeni: string, k: string): number {
  const [r1, m1, d1] = narozeni.split('-').map(Number);
  const [r2, m2, d2] = k.split('-').map(Number);
  return r2! - r1! - (m2! < m1! || (m2 === m1 && d2! < d1!) ? 1 : 0);
}

/** Cena z ceníku tábora. Neznámé kódy se tiše vynechají. */
export function spoctiCenu(
  tabor: Pick<Tabor, 'varianty' | 'priplatky'>,
  variantaKod: string,
  priplatkyKody: string[],
): { varianta: Polozka | null; priplatky: Polozka[]; cena: number } {
  const varianta = tabor.varianty.find((v) => v.kod === variantaKod) ?? null;
  const priplatky = tabor.priplatky.filter((p) => priplatkyKody.includes(p.kod));
  const cena = (varianta?.cena ?? 0) + priplatky.reduce((s, p) => s + p.cena, 0);
  return { varianta, priplatky, cena };
}

/**
 * Do kdy zaplatit. Běžně X dní před nástupem. Když se místo potvrdí
 * pozdě, dostane rodič aspoň týden, nejdéle ale do dne nástupu.
 */
export function splatnost(tabor: Pick<Tabor, 'zacatek' | 'splatnost_dni'>): string {
  const radna = posunDnu(tabor.zacatek, -tabor.splatnost_dni);
  const zaTyden = posunDnu(dnesCz(), 7);
  if (radna >= zaTyden) return radna;
  return zaTyden < tabor.zacatek ? zaTyden : tabor.zacatek;
}

/* ------------------------------------------------------------------ QR Platba */

function mod97(cislice: string): number {
  let zbytek = 0;
  for (const c of cislice) zbytek = (zbytek * 10 + Number(c)) % 97;
  return zbytek;
}

/** `86-5310227/0100` → `CZ…` Vrací `null`, když číslo účtu nedává smysl. */
export function iban(ucet: string): string | null {
  const m = ucet.replace(/\s/g, '').match(/^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/);
  if (!m) return null;
  const bban = m[3]! + (m[1] ?? '').padStart(6, '0') + m[2]!.padStart(10, '0');
  // CZ = 12 35, kontrolní číslice zatím 00.
  const kontrola = String(98 - mod97(`${bban}123500`)).padStart(2, '0');
  return `CZ${kontrola}${bban}`;
}

export const ucetStaje = site.bankAccount;
const ibanStaje = iban(ucetStaje);

/** Text pro QR Platbu. `null`, když účet stáje nejde převést na IBAN. */
export function spayd(platba: { castka: number; vs: string; splatnost?: string }): string | null {
  if (!ibanStaje) return null;
  const casti = [
    'SPD',
    '1.0',
    `ACC:${ibanStaje}`,
    `AM:${platba.castka.toFixed(2)}`,
    'CC:CZK',
    `X-VS:${platba.vs}`,
  ];
  if (platba.splatnost) casti.push(`DT:${platba.splatnost.replaceAll('-', '')}`);
  casti.push(`MSG:PRIHLASKA ${platba.vs}`);
  return casti.join('*');
}

/** QR kód jako inline SVG pro stránku. */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#16211c', light: '#ffffff' },
  });
}

/** QR kód jako PNG pro e-mail. SVG většina e-mailových programů nezobrazí. */
export async function qrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    type: 'png',
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

/** Odkaz na PNG s QR kódem. V adrese jsou jen částka, VS a splatnost. */
export function qrOdkaz(
  zaklad: string,
  platba: { castka: number; vs: string; splatnost?: string },
): string {
  const url = new URL('/prihlasky/qr', zaklad);
  url.searchParams.set('castka', String(platba.castka));
  url.searchParams.set('vs', platba.vs);
  if (platba.splatnost) url.searchParams.set('splatnost', platba.splatnost);
  return url.toString();
}
