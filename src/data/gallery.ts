/**
 * Fotogalerie, zároveň knihovna fotek pro celý web.
 *
 * Jeden záznam v `src/obsah/galerie/` = jedna fotka. Ostatní stránky se na
 * fotku odkazují jejím názvem, takže každá fotka je v repozitáři jen jednou.
 */

import type { ImageMetadata } from 'astro';
import { collection } from './_content';
import { photo } from './images';

export type GalleryTag = 'zavody' | 'areal' | 'skola' | 'penzion' | 'kurzy';

export const galleryTagLabels: Record<GalleryTag, string> = {
  zavody: 'Závody',
  areal: 'Areál',
  skola: 'Jezdecká škola',
  penzion: 'Penzion',
  kurzy: 'Kurzy pro děti',
};

export interface GalleryPhoto {
  src: ImageMetadata;
  alt: string;
  tag: GalleryTag;
  /** Název fotky, kterým se na ni odkazuje zbytek webu. */
  file: string;
}

interface RawPhoto {
  image: string;
  alt?: string;
  tag?: GalleryTag;
  order?: number;
}

export const photos: GalleryPhoto[] = collection<RawPhoto>(
  import.meta.glob('/src/obsah/galerie/*.json', { eager: true }),
)
  .map((p) => {
    const src = photo(p.image) ?? photo(p.slug);
    if (!src) return null;
    return {
      src,
      file: p.slug,
      alt: p.alt?.trim() || 'Fotografie z areálu Stáje Manon',
      tag: (p.tag ?? 'areal') as GalleryTag,
      order: p.order ?? 9999,
    };
  })
  .filter((p): p is GalleryPhoto & { order: number } => p !== null)
  .sort((a, b) => a.order - b.order || a.file.localeCompare(b.file))
  .map(({ order: _order, ...p }) => p);

export function photosByTag(tag: GalleryTag): GalleryPhoto[] {
  return photos.filter((p) => p.tag === tag);
}

/** Vybrané fotky v zadaném pořadí, podle názvu z galerie. */
export function pickPhotos(names: readonly string[]): GalleryPhoto[] {
  return names
    .map((n) => photos.find((p) => p.file === n))
    .filter((p): p is GalleryPhoto => Boolean(p));
}
