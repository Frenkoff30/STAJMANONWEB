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
import { platneDatum, posunDnu, type Slot } from '@/lib/rezervace';

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
 * Které sloty akce zabere. Prázdné „od" i „do" znamená celý den — pak se
 * vrátí `[null]`, tedy jediná blokace bez slotu, což je v databázi zápis
 * pro celý den. Vyplněné jen jedno z nich zavírá od začátku dne, nebo do
 * jeho konce.
 */
function sloty(seznam: Slot[], od: string, doKdy: string): (string | null)[] {
  if (!od && !doKdy) return [null];

  const zacatek = od ? seznam.findIndex((s) => s.kod === od) : 0;
  const konec = doKdy ? seznam.findIndex((s) => s.kod === doKdy) : seznam.length - 1;

  // Neznámý slot (třeba po změně rozvrhu) radši zavře celý den, než aby
  // akce zůstala bez blokace a někdo si do ní zarezervoval.
  if (zacatek < 0 || konec < 0) return [null];

  const [prvni, posledni] = zacatek <= konec ? [zacatek, konec] : [konec, zacatek];
  return seznam.slice(prvni, posledni + 1).map((s) => s.kod);
}

/**
 * Srovná blokace s tím, co je u akce zaškrtnuté. Volá se po každém uložení
 * akce — staré blokace té akce zmizí a vzniknou nové podle aktuálního
 * termínu. Vrací chybu k zobrazení, nebo prázdný řetězec.
 */
export async function srovnejBlokace(
  supabase: SupabaseClient,
  akce: {
    kod: string;
    nazev: string;
    zacatek: string;
    konec: string;
    zavrit_jizdarnu: string;
    zavrit_od: string;
    zavrit_do: string;
  },
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

  const { data } = await supabase
    .from('sloty')
    .select('*')
    .eq('aktivni', true)
    .order('poradi');

  const zabrane = sloty((data as Slot[]) ?? [], akce.zavrit_od, akce.zavrit_do);

  const { error } = await supabase.from('blokace').insert(
    dny.flatMap((datum) =>
      zabrane.map((slot) => ({
        datum,
        // Prázdná jízdárna znamená všechny, prázdný slot celý den.
        jizdarna: co === VSECHNY ? null : co,
        slot,
        duvod: akce.nazev.slice(0, 60),
        akce: akce.kod,
      })),
    ),
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
