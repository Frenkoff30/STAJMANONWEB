/**
 * Novinky — krátké zprávy ze stáje (změna termínu, startovní listiny,
 * pozvánky). Spravuje je redakční systém v `src/obsah/novinky/`.
 *
 * Nejnovější tři se ukazují na úvodní stránce, všechny na /novinky.
 * Každá má vlastní adresu /novinky/<slug>, aby šla sdílet na Facebook
 * s vlastním nadpisem a fotkou.
 */

import type { ImageMetadata } from 'astro';
import { collection, opt } from './_content';
import { photo } from './images';

export interface NewsItem {
  slug: string;
  title: string;
  /** ISO datum (YYYY-MM-DD) */
  date: string;
  /** Odstavce textu, oddělené prázdným řádkem v redakci. */
  paragraphs: string[];
  image?: ImageMetadata;
  file?: { label: string; href: string };
  link?: { label: string; href: string };
}

interface RawNews {
  title: string;
  date: string;
  text?: string;
  image?: string | null;
  file?: string | null;
  fileLabel?: string;
  link?: string | null;
  linkLabel?: string;
}

export const news: NewsItem[] = collection<RawNews>(
  import.meta.glob('/src/obsah/novinky/*.json', { eager: true }),
)
  .map((n) => {
    const file = opt(n.file);
    const link = opt(n.link);
    return {
      slug: n.slug,
      title: n.title,
      date: n.date,
      paragraphs: (n.text ?? '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      image: photo(n.image),
      file: file ? { label: opt(n.fileLabel) ?? 'Soubor ke stažení', href: file } : undefined,
      link: link ? { label: opt(n.linkLabel) ?? 'Více informací', href: link } : undefined,
    };
  })
  // Nejnovější první; ve stejný den rozhoduje název, ať je pořadí stálé.
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

/** Odkaz, kterým se novinka sdílí na Facebook. */
export function facebookShare(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
