import type { ImageMetadata } from 'astro';

export type GalleryTag = 'zavody' | 'areal' | 'skola' | 'penzion' | 'kurzy';

export const galleryTagLabels: Record<GalleryTag, string> = {
  zavody: 'Závody',
  areal: 'Areál',
  skola: 'Jezdecká škola',
  penzion: 'Penzion',
  kurzy: 'Kurzy pro děti',
};

/**
 * Popisky a zařazení fotek. Klíč = název souboru v src/assets/photos.
 * Fotky pocházejí z původního webu; názvy souborů odpovídají tomu,
 * co je na nich skutečně vidět.
 */
const meta: Record<string, { alt: string; tag: GalleryTag }> = {
  /* --- Areál ---------------------------------------------------------- */
  'areal-letecky.jpg': { alt: 'Letecký pohled na areál Jízdárna Suchá', tag: 'areal' },
  'areal-budovy.jpg': { alt: 'Budovy areálu Jízdárna Suchá s parkovištěm', tag: 'areal' },
  'hala-01.jpg': { alt: 'Krytá jezdecká hala 23 × 66 m se skokovým materiálem', tag: 'areal' },
  'kolbiste-01.jpg': { alt: 'Venkovní kolbiště s parkurovými překážkami', tag: 'areal' },
  'kolbiste-02.jpg': { alt: 'Venkovní kolbiště připravené na závody', tag: 'areal' },
  'kolbiste-vecer.jpg': { alt: 'Kolbiště při západu slunce', tag: 'areal' },
  'boxy-01.jpg': { alt: 'Stájová chodba s boxy pro koně', tag: 'areal' },
  'pastvina-01.jpg': { alt: 'Kůň na pastvině u areálu', tag: 'areal' },
  'portret-kun.jpg': { alt: 'Jiří Skřivan s bělouše ve stáji', tag: 'areal' },

  /* --- Penzion a restaurace -------------------------------------------- */
  'penzion-exterier.jpg': { alt: 'Budova penzionu Jízdárna Suchá s venkovní terasou', tag: 'penzion' },
  'penzion-detail.jpg': { alt: 'Vybavení pokoje — konvice a čajový koutek', tag: 'penzion' },
  'pokoj-01.jpg': { alt: 'Dvoulůžkový pokoj penzionu s vlastní koupelnou', tag: 'penzion' },
  'pokoj-02.jpg': { alt: 'Pokoj penzionu s televizí a psacím stolem', tag: 'penzion' },
  'pokoj-03.jpg': { alt: 'Třílůžkový pokoj s oddělenými postelemi', tag: 'penzion' },
  'pokoj-04.jpg': { alt: 'Pokoj penzionu s výhledem do areálu', tag: 'penzion' },
  'pokoj-05.jpg': { alt: 'Pokoj penzionu Jízdárna Suchá', tag: 'penzion' },
  'pokoj-06.jpg': { alt: 'Pokoj s patrovými postelemi pro účastníky kurzů', tag: 'penzion' },
  'restaurace-01.jpg': { alt: 'Restaurace penzionu s dřevěnými stoly', tag: 'penzion' },
  'restaurace-02.jpg': { alt: 'Bar a posezení v restauraci penzionu', tag: 'penzion' },
  'terasa-01.jpg': { alt: 'Venkovní terasa s výhledem na kolbiště během závodů', tag: 'penzion' },
  'terasa-02.jpg': { alt: 'Posezení na terase u kolbiště', tag: 'penzion' },

  /* --- Jezdecká škola a kurzy ------------------------------------------ */
  'skola-01.jpg': { alt: 'Výuka jízdy na koni v kryté hale', tag: 'skola' },
  'skola-02.jpg': { alt: 'Dívka se stará o koně před lekcí', tag: 'skola' },
  'skola-03.jpg': { alt: 'Mladá jezdkyně na koni v jízdárně', tag: 'skola' },
  'kurzy-pony.jpg': { alt: 'Dvě dívky na ponym během prázdninového kurzu', tag: 'kurzy' },
  'deti-kun.jpg': { alt: 'Dívka s bělouše na jezdeckém kurzu', tag: 'kurzy' },
  'deti-skupina.jpg': { alt: 'Účastníci jezdeckých her pro děti', tag: 'kurzy' },
  'deti-parkur.jpg': { alt: 'Dítě na ponym na parkuru jezdeckých her', tag: 'kurzy' },

  /* --- Sport a závody --------------------------------------------------- */
  'vc-divaci.jpg': { alt: 'Diváci na tribuně Velké ceny Litomyšle', tag: 'zavody' },
  'vc-skok.jpg': { alt: 'Skok na parkuru Velké ceny Litomyšle', tag: 'zavody' },
  'vc-areal.jpg': { alt: 'Areál během Velké ceny Litomyšle', tag: 'zavody' },
  'zavody-oxer.jpg': { alt: 'Jezdec přeskakuje oxer na domácích závodech', tag: 'zavody' },
  'zavody-skok-01.jpg': { alt: 'Parkurový skok na kolbišti v Suché', tag: 'zavody' },
  'zavody-skok-02.jpg': { alt: 'Jezdec na parkuru domácích závodů', tag: 'zavody' },
  'divaci-01.jpg': { alt: 'Diváci sledují jezdecké závody', tag: 'zavody' },
  'uspechy-01.jpg': { alt: 'Jiří Skřivan na parkuru', tag: 'zavody' },
  'uspechy-02.jpg': { alt: 'Dekorování vítězů Volvo World Cupu', tag: 'zavody' },
  'uspechy-03.jpg': { alt: 'Jezdec Stáje Manon po vítězné jízdě', tag: 'zavody' },
  'skrivan-01.jpg': { alt: 'Jiří Skřivan na parkuru', tag: 'zavody' },
  'skrivan-02.jpg': { alt: 'Jiří Skřivan v sedle', tag: 'zavody' },

  /* --- Archiv fotogalerie ---------------------------------------------- */
  'gal-01.jpg': { alt: 'Vítězné kolo s čabrakou', tag: 'zavody' },
  'gal-02.jpg': { alt: 'Kůň s vítěznou čabrakou po soutěži', tag: 'zavody' },
  'gal-03.jpg': { alt: 'Dekorování vítězů', tag: 'zavody' },
  'gal-04.jpg': { alt: 'Závody spřežení v areálu Suchá', tag: 'zavody' },
  'gal-05.jpg': { alt: 'Diváci u kolbiště', tag: 'areal' },
  'gal-06.jpg': { alt: 'Kůň s doprovodem po soutěži', tag: 'zavody' },
  'gal-07.jpg': { alt: 'Travnaté kolbiště během závodů', tag: 'areal' },
  'gal-08.jpg': { alt: 'Vyhlášení výsledků', tag: 'zavody' },
  'gal-09.jpg': { alt: 'Zaplněné tribuny u kolbiště', tag: 'zavody' },
  'gal-10.jpg': { alt: 'Bělouš na parkuru', tag: 'zavody' },
  'gal-11.jpg': { alt: 'Zázemí pořadatelů závodů', tag: 'zavody' },
  'gal-12.jpg': { alt: 'Doprovodný program závodů', tag: 'areal' },
  'gal-13.jpg': { alt: 'Vítěz soutěže s čabrakou', tag: 'zavody' },
  'gal-14.jpg': { alt: 'Jezdecká dvojice na parkuru', tag: 'zavody' },
  'gal-15.jpg': { alt: 'Stupně vítězů Českého skokového poháru', tag: 'zavody' },
  'gal-16.jpg': { alt: 'Vítězná jízda s čestnou dekou', tag: 'zavody' },
  'gal-17.jpg': { alt: 'Terasa a zázemí během závodního dne', tag: 'areal' },
  'gal-18.jpg': { alt: 'Areál Jízdárna Suchá', tag: 'areal' },
  'gal-19.jpg': { alt: 'Ceny a čabraky pro vítěze', tag: 'zavody' },
  'gal-20.jpg': { alt: 'Skok přes barevnou překážku', tag: 'zavody' },
  'gal-21.jpg': { alt: 'Jezdec s trofejí', tag: 'zavody' },
  'gal-22.jpg': { alt: 'Bělouš nad překážkou', tag: 'zavody' },
  'gal-23.jpg': { alt: 'Účastnice jezdeckého kurzu', tag: 'kurzy' },
  'gal-24.jpg': { alt: 'Mladá jezdkyně v helmě', tag: 'kurzy' },
  'gal-25.jpg': { alt: 'Jezdci Stáje Manon v klubových barvách', tag: 'zavody' },
  'gal-26.jpg': { alt: 'Volvo World Cup — společné foto', tag: 'zavody' },
  'gal-27.jpg': { alt: 'Areál z výšky', tag: 'areal' },
  'gal-28.jpg': { alt: 'Letecký pohled na kolbiště a stáje', tag: 'areal' },
  'gal-29.jpg': { alt: 'Venkovní kolbiště s překážkami', tag: 'areal' },
  'gal-30.jpg': { alt: 'Kolbiště za soumraku', tag: 'areal' },
};

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/*.{jpg,JPG,jpeg,png}',
  { eager: true },
);

export interface GalleryPhoto {
  src: ImageMetadata;
  alt: string;
  tag: GalleryTag;
  file: string;
}

/** Všechny fotky, seřazené podle názvu souboru. */
export const photos: GalleryPhoto[] = Object.entries(modules)
  .map(([path, mod]) => {
    const file = path.split('/').pop()!;
    const info = meta[file];
    return {
      src: mod.default,
      file,
      alt: info?.alt ?? 'Fotografie z areálu Stáje Manon',
      tag: info?.tag ?? ('areal' as GalleryTag),
    };
  })
  .sort((a, b) => a.file.localeCompare(b.file));

export function photosByTag(tag: GalleryTag): GalleryPhoto[] {
  return photos.filter((p) => p.tag === tag);
}

/** Vybrané soubory podle názvu — pro ruční sestavení sekvence. */
export function pickPhotos(files: string[]): GalleryPhoto[] {
  return files
    .map((f) => photos.find((p) => p.file === f))
    .filter((p): p is GalleryPhoto => Boolean(p));
}

/** Pás na homepage — velké, reprezentativní fotky napříč tématy. */
export const featuredPhotos: GalleryPhoto[] = pickPhotos([
  'vc-skok.jpg',
  'kurzy-pony.jpg',
  'restaurace-01.jpg',
  'hala-01.jpg',
  'vc-divaci.jpg',
  'pokoj-02.jpg',
  'skola-01.jpg',
  'kolbiste-02.jpg',
  'deti-parkur.jpg',
  'terasa-01.jpg',
  'zavody-oxer.jpg',
  'areal-letecky.jpg',
]);
