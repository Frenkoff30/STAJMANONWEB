import type { ImageMetadata } from 'astro';

/**
 * Koně aktuálně nabízení k prodeji.
 *
 * Stránka /kone-na-prodej se sama přepne mezi výpisem a „momentálně nemáme
 * volného koně" podle toho, jestli je pole prázdné. Fotku importujte nahoře:
 *
 *   import kun from '@/assets/photos/kun-nazev.jpg';
 *   … { slug: 'nazev', name: 'Název', image: kun, … }
 */

export interface HorseForSale {
  slug: string;
  name: string;
  /** Ročník narození */
  year?: string;
  breed?: string;
  /** valach / klisna / hřebec */
  sex?: string;
  description: string;
  price?: string;
  image?: ImageMetadata;
}

export const horsesForSale: HorseForSale[] = [];
