/**
 * Nahrávání souborů ze správy do úložiště Supabase (bucket `soubory`,
 * viz supabase/uprava-kalendar.sql). Rozpisy k akcím, fotky a přílohy
 * k novinkám. Číst je smí kdokoli přes veřejný odkaz, nahrávat jen správce.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/** Vercel víc než ~4,5 MB v jednom požadavku nepustí, necháme rezervu. */
export const MAX_SOUBOR = 4 * 1024 * 1024;

export const PRIPONY_DOKUMENTU = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
export const PRIPONY_FOTEK = ['jpg', 'jpeg', 'png', 'webp'];

/** `pdf` → `PDF`, `jpeg` → `JPG`: do popisku odkazu „Rozpis (PDF)“. */
export function druhSouboru(pripona: string): string {
  return pripona === 'jpeg' ? 'JPG' : pripona.toUpperCase();
}

/**
 * Nahraje soubor a vrátí veřejný odkaz. Při chybě vrátí hlášku pro člověka.
 *
 * @param slozka  `akce` nebo `novinky`
 * @param zaklad  začátek názvu souboru, třeba kód akce
 */
export async function nahratSoubor(
  supabase: SupabaseClient,
  soubor: File,
  slozka: string,
  zaklad: string,
  pripony: string[],
): Promise<{ url: string; pripona: string } | { chyba: string }> {
  const pripona = (soubor.name.split('.').pop() ?? '').toLowerCase();
  if (!pripony.includes(pripona)) {
    return { chyba: `Tenhle druh souboru nejde nahrát. Povolené: ${pripony.map(druhSouboru).join(', ')}.` };
  }
  if (soubor.size > MAX_SOUBOR) {
    return { chyba: 'Soubor je větší než 4 MB. Zmenšete ho prosím.' };
  }

  // Časová značka v názvu: nový soubor nepřepíše starý v mezipaměti prohlížečů.
  const cesta = `${slozka}/${zaklad}-${Date.now()}.${pripona}`;
  const uloziste = supabase.storage.from('soubory');
  const { error } = await uloziste.upload(cesta, soubor, {
    contentType: soubor.type || undefined,
    upsert: false,
  });
  if (error) {
    console.error('Soubor se nenahrál', error.message);
    return { chyba: 'Soubor se nepodařilo nahrát. Zkuste to prosím znovu.' };
  }

  return { url: uloziste.getPublicUrl(cesta).data.publicUrl, pripona };
}
