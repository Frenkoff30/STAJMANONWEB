/**
 * Akce, která si zabere jízdárnu.
 *
 * Z akce se udělá blokace na každý její den, takže se ten termín v
 * rezervacích nedá zamluvit a místo volných políček je v kalendáři vidět
 * název akce. Blokace si pamatuje, ze které akce vznikla — při změně
 * termínu se podle toho ty staré najdou a nahradí. Ručně zadaných blokací
 * (bez kódu akce) se to netýká.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { platneDatum, posunDnu } from '@/lib/rezervace';

/** Hodnota znamenající „zavřít všechny jízdárny". */
export const VSECHNY = 'vse';

/** Strop na délku akce. Překlep v roce jinak zavře jízdárnu na věky. */
const MAX_DNU = 60;

/** Dny akce včetně prvního a posledního. */
function dnyAkce(zacatek: string, konec: string): string[] {
  if (!platneDatum(zacatek)) return [];
  const posledni = platneDatum(konec) && konec >= zacatek ? konec : zacatek;

  const dny: string[] = [];
  for (let d = zacatek; d <= posledni && dny.length < MAX_DNU; d = posunDnu(d, 1)) {
    dny.push(d);
  }
  return dny;
}

/**
 * Srovná blokace s tím, co je u akce zaškrtnuté. Volá se po každém uložení
 * akce — staré blokace té akce zmizí a vzniknou nové podle aktuálního
 * termínu. Vrací chybu k zobrazení, nebo prázdný řetězec.
 */
export async function srovnejBlokace(
  supabase: SupabaseClient,
  akce: { kod: string; nazev: string; zacatek: string; konec: string; zavrit_jizdarnu: string },
): Promise<string> {
  const { error: chybaMazani } = await supabase
    .from('blokace')
    .delete()
    .eq('akce', akce.kod);

  if (chybaMazani) return 'Akce je uložená, ale zavření jízdárny se nepodařilo přepsat.';

  const co = akce.zavrit_jizdarnu.trim();
  if (!co) return '';

  const dny = dnyAkce(akce.zacatek, akce.konec);
  if (dny.length === 0) return '';

  const { error } = await supabase.from('blokace').insert(
    dny.map((datum) => ({
      datum,
      // Prázdná jízdárna i prázdný slot znamenají „všechny" a „celý den".
      jizdarna: co === VSECHNY ? null : co,
      slot: null,
      duvod: akce.nazev.slice(0, 60),
      akce: akce.kod,
    })),
  );

  return error ? 'Akce je uložená, ale jízdárnu se nepodařilo zavřít.' : '';
}

/** Zrušená akce po sobě nenechá zavřené termíny. */
export async function zrusBlokace(
  supabase: SupabaseClient,
  kod: string,
): Promise<void> {
  await supabase.from('blokace').delete().eq('akce', kod);
}
