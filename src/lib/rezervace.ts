/**
 * Počítání s datem a časem pro rezervace.
 *
 * Data se všude vozí jako řetězec `YYYY-MM-DD` a časy jako `HH:MM`, nikdy
 * jako `Date`. Objekt `Date` v JavaScriptu nese časovou zónu serveru a na
 * Vercelu je server v UTC. V zimě by tak „dnešek" končil v jednu ráno
 * a půlnoční rezervace by padaly do špatného dne.
 */

const ZONA = 'Europe/Prague';

export interface Jizdarna {
  kod: string;
  nazev: string;
  popis: string;
  kapacita: number;
  /** Doporučený počet koní v jednom čase. 0 = nic se nedoporučuje. */
  doporuceni_koni: number;
  poradi: number;
  aktivni: boolean;
}

export interface Slot {
  kod: string;
  zacatek: string;
  konec: string;
  poradi: number;
  aktivni: boolean;
}

export interface Blokace {
  id: string;
  jizdarna: string | null;
  slot: string | null;
  datum: string;
  duvod: string;
}

export interface Oznameni {
  id: string;
  text: string;
  typ: 'info' | 'dulezite';
}

/** Jeden řádek z databázové funkce `kalendar()`. */
export interface ObsazenostSlotu {
  jizdarna: string;
  datum: string;
  slot: string;
  obsazeno: number;
  /** Součet koní všech rezervací v tom slotu. */
  koni: number;
  /** Vyplněné jen pro přihlášené členy, jinak `null`. */
  jmena: string[] | null;
  /** Vyplněné, když v tom slotu má rezervaci právě přihlášený člověk. */
  moje_id: string | null;
}

export interface Rezervace {
  id: string;
  jizdarna: string;
  slot: string;
  datum: string;
  poznamka: string;
  pocet_koni: number;
  /** Rezervace založené jedním opakováním mají společné id. */
  serie: string | null;
  vytvoreno: string;
}

/* ------------------------------------------------------------------ datum */

/** Dnešek v Česku, `YYYY-MM-DD`. Formát `sv-SE` je shodou okolností ISO. */
export function dnesCz(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: ZONA }).format(new Date());
}

/** Aktuální čas v Česku, `HH:MM`. */
export function casCz(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

/** Posun o dny. Počítá se v UTC, takže letní čas nic neposune. */
export function posunDnu(datum: string, dnu: number): string {
  const [r, m, d] = datum.split('-').map(Number);
  const cas = Date.UTC(r!, m! - 1, d!) + dnu * 86_400_000;
  return new Date(cas).toISOString().slice(0, 10);
}

/** Pondělí týdne, do kterého datum spadá. */
export function pondeliTydne(datum: string): string {
  const [r, m, d] = datum.split('-').map(Number);
  const den = new Date(Date.UTC(r!, m! - 1, d!)).getUTCDay(); // 0 = neděle
  return posunDnu(datum, den === 0 ? -6 : 1 - den);
}

/** Sedm dnů týdne počínaje pondělím. */
export function dnyTydne(pondeli: string): string[] {
  return Array.from({ length: 7 }, (_, i) => posunDnu(pondeli, i));
}

/** Je ten řetězec platné datum `YYYY-MM-DD`? Chrání před podvrženým odkazem. */
export function platneDatum(datum: unknown): datum is string {
  if (typeof datum !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return false;
  const [r, m, d] = datum.split('-').map(Number);
  const test = new Date(Date.UTC(r!, m! - 1, d!));
  return (
    test.getUTCFullYear() === r &&
    test.getUTCMonth() === m! - 1 &&
    test.getUTCDate() === d
  );
}

const DNY = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const DNY_ZKRATKA = ['NE', 'PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO'];
const MESICE = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince',
];

function rozlozit(datum: string) {
  const [r, m, d] = datum.split('-').map(Number);
  return { rok: r!, mesic: m!, den: d!, denVTydnu: new Date(Date.UTC(r!, m! - 1, d!)).getUTCDay() };
}

/** `PO` */
export function zkratkaDne(datum: string): string {
  return DNY_ZKRATKA[rozlozit(datum).denVTydnu]!;
}

/** `pondělí` */
export function nazevDne(datum: string): string {
  return DNY[rozlozit(datum).denVTydnu]!;
}

/** `7. 9.` */
export function kratkeDatum(datum: string): string {
  const { den, mesic } = rozlozit(datum);
  return `${den}. ${mesic}.`;
}

/** `pondělí 7. září 2026` */
export function dlouheDatum(datum: string): string {
  const { den, mesic, rok } = rozlozit(datum);
  return `${nazevDne(datum)} ${den}. ${MESICE[mesic - 1]} ${rok}`;
}

/** `7. 9. – 13. 9. 2026` */
export function rozsahTydne(pondeli: string): string {
  const nedele = posunDnu(pondeli, 6);
  return `${kratkeDatum(pondeli)} – ${kratkeDatum(nedele)} ${rozlozit(nedele).rok}`;
}

/** `06:30` → `6:30` */
export function cas(hodnota: string): string {
  return hodnota.slice(0, 5).replace(/^0/, '');
}

/** `6:30 – 8:30` */
export function rozsahSlotu(slot: Slot): string {
  return `${cas(slot.zacatek)} – ${cas(slot.konec)}`;
}

/** Je slot v minulosti? Rozhoduje začátek, ne konec. */
export function jeMinulost(datum: string, zacatek: string): boolean {
  const dnes = dnesCz();
  if (datum < dnes) return true;
  if (datum > dnes) return false;
  return zacatek.slice(0, 5) <= casCz();
}

/** Je na tenhle termín blokace od stáje? Vrací důvod, nebo `null`. */
export function najdiBlokaci(
  blokace: Blokace[],
  jizdarna: string,
  datum: string,
  slot: string,
): Blokace | null {
  return (
    blokace.find(
      (b) =>
        b.datum === datum &&
        (b.jizdarna === null || b.jizdarna === jizdarna) &&
        (b.slot === null || b.slot === slot),
    ) ?? null
  );
}

/** Skloňování: 1 volné místo, 2 volná místa, 5 volných míst. */
export function volnaMista(pocet: number): string {
  if (pocet === 1) return '1 volné místo';
  if (pocet >= 2 && pocet <= 4) return `${pocet} volná místa`;
  return `${pocet} volných míst`;
}

/** Skloňování: 1 místo, 2 místa, 5 míst. */
export function mista(pocet: number): string {
  if (pocet === 1) return '1 místo';
  if (pocet >= 2 && pocet <= 4) return `${pocet} místa`;
  return `${pocet} míst`;
}

/** Skloňování: 1 kůň, 2 koně, 5 koní. */
export function kone(pocet: number): string {
  if (pocet === 1) return '1 kůň';
  if (pocet >= 2 && pocet <= 4) return `${pocet} koně`;
  return `${pocet} koní`;
}

/** `Doporučujeme nejvýš 8 koní v jednom čase.` Bez doporučení prázdný text. */
export function doporuceniTextu(jizdarna: Jizdarna): string {
  return jizdarna.doporuceni_koni > 0
    ? `Doporučujeme nejvýš ${kone(jizdarna.doporuceni_koni)} v jednom čase`
    : '';
}

/**
 * Navazující sloty počínaje zvoleným. Vrací nejvýš `pocet` kusů a končí
 * tam, kde rozvrh přestane navazovat — tři hodiny v kuse se dají zamluvit
 * jen tehdy, když na sebe časy opravdu sedí.
 */
export function navazujiciSloty(sloty: Slot[], od: string, pocet: number): Slot[] {
  const start = sloty.findIndex((s) => s.kod === od);
  if (start < 0) return [];

  const rada = [sloty[start]!];
  for (let i = start + 1; i < sloty.length && rada.length < pocet; i += 1) {
    const predchozi = rada[rada.length - 1]!;
    if (sloty[i]!.zacatek !== predchozi.konec) break;
    rada.push(sloty[i]!);
  }
  return rada;
}

/** Data opakování po týdnech: `datum`, +7 dní, … až do `dokdy` včetně. */
export function tydenniOpakovani(datum: string, dokdy: string, strop = 60): string[] {
  const data: string[] = [];
  for (let d = datum; d <= dokdy && data.length < strop; d = posunDnu(d, 7)) {
    data.push(d);
  }
  return data;
}
