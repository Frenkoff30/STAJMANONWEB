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
import type { Akce, Polozka } from './db';
import type { VyplnenyUcastnik } from './formular';

/** `11400` → `11 400 Kč` (s nezlomitelnou mezerou). */
export function kc(castka: number): string {
  return `${castka.toLocaleString('cs-CZ')} Kč`;
}

/** `4.–10. července 2027`, u jednodenní akce jen `28. března 2027`. */
export function terminAkce(akce: Pick<Akce, 'zacatek' | 'konec'>): string {
  return formatRange({
    start: akce.zacatek,
    end: akce.konec === akce.zacatek ? undefined : akce.konec,
    title: '',
    kind: 'pobyt',
  });
}

/** Věk v celých letech k danému dni. */
export function vek(narozeni: string, k: string): number {
  const [r1, m1, d1] = narozeni.split('-').map(Number);
  const [r2, m2, d2] = k.split('-').map(Number);
  return r2! - r1! - (m2! < m1! || (m2 === m1 && d2! < d1!) ? 1 : 0);
}

/** Položky z ceníku akce podle vybraných kódů. Neznámé kódy se tiše vynechají. */
export function polozkyUcastnika(
  akce: Pick<Akce, 'varianty' | 'priplatky'>,
  u: Pick<VyplnenyUcastnik, 'varianty' | 'priplatky'>,
): Polozka[] {
  return [
    ...akce.varianty.filter((v) => u.varianty.includes(v.kod)),
    ...akce.priplatky.filter((p) => u.priplatky.includes(p.kod)),
  ];
}

export function cenaUcastnika(
  akce: Pick<Akce, 'varianty' | 'priplatky'>,
  u: Pick<VyplnenyUcastnik, 'varianty' | 'priplatky'>,
): number {
  return polozkyUcastnika(akce, u).reduce((s, p) => s + p.cena, 0);
}

/** Cena celé přihlášky. Počítá se stejně jako v databázi, jen pro náhled. */
export function spoctiCenu(
  akce: Pick<Akce, 'varianty' | 'priplatky'>,
  ucastnici: Pick<VyplnenyUcastnik, 'varianty' | 'priplatky'>[],
): number {
  return ucastnici.reduce((s, u) => s + cenaUcastnika(akce, u), 0);
}

/**
 * Do kdy zaplatit. Běžně X dní před nástupem. Když se místo potvrdí
 * pozdě, dostane rodič aspoň týden, nejdéle ale do dne nástupu.
 */
export function splatnost(akce: Pick<Akce, 'zacatek' | 'splatnost_dni'>): string {
  const radna = posunDnu(akce.zacatek, -akce.splatnost_dni);
  const zaTyden = posunDnu(dnesCz(), 7);
  if (radna >= zaTyden) return radna;
  return zaTyden < akce.zacatek ? zaTyden : akce.zacatek;
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
