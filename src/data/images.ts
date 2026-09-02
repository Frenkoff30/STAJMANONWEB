/**
 * Most mezi fotkou vybranou v redakčním systému a `astro:assets`.
 *
 * Každá fotka má vlastní složku `src/assets/photos/<nazev>/image.jpg`.
 * Název složky je zároveň jejím identifikátorem: v obsahu stránek stačí
 * napsat `areal-letecky` a fotka se najde. Astro ji pak sám zmenší,
 * převede na WebP a vygeneruje varianty pro různé šířky obrazovky.
 */

import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,avif}',
  { eager: true },
);

/** Klíčem je název složky, hodnotou fotka v ní. */
const byName = new Map<string, ImageMetadata>();
/** Klíčem je celá cesta — obsah galerie ji ukládá takto. */
const byPath = new Map<string, ImageMetadata>();

for (const [path, mod] of Object.entries(modules)) {
  const parts = path.split('/');
  const name = parts[parts.length - 2]!;
  byPath.set(path, mod.default);
  if (!byName.has(name)) byName.set(name, mod.default);
}

/**
 * Fotka podle názvu ze složky (`areal-letecky`) nebo podle celé cesty.
 * Vrátí `undefined`, když soubor chybí — stránka pak fotku prostě vynechá.
 */
export function photo(ref: string | null | undefined): ImageMetadata | undefined {
  if (!ref) return undefined;
  return byName.get(ref) ?? byPath.get(ref);
}
