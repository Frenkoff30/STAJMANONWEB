/**
 * Koně aktuálně nabízení k prodeji.
 * Spravuje redakční systém v `src/obsah/kone.json` — dokud je seznam prázdný,
 * stránka /kone-na-prodej ukazuje variantu „momentálně nemáme volného koně".
 */

import type { ImageMetadata } from 'astro';
import { opt } from './_content';
import { photo } from './images';
import data from '../obsah/kone.json';

export interface HorseForSale {
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

interface RawHorse {
  name: string;
  year?: string;
  breed?: string;
  sex?: string;
  description: string;
  price?: string;
  image?: string;
}

export const horsesForSale: HorseForSale[] = (data.horses as RawHorse[]).map(
  (h) => ({
    name: h.name,
    year: opt(h.year),
    breed: opt(h.breed),
    sex: opt(h.sex),
    description: h.description,
    price: opt(h.price),
    image: photo(h.image),
  }),
);
