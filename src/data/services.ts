/**
 * Služby stáje a vybavení areálu.
 * Služby: `src/obsah/sluzby.json`, vybavení: `src/obsah/areal.json`.
 * Pořadí ve výpisu odpovídá pořadí v administraci.
 */

import { opt } from './_content';
import arealData from '../obsah/areal.json';
import sluzbyData from '../obsah/sluzby.json';

export interface Service {
  slug: string;
  title: string;
  summary: string;
  detail?: string;
  price?: string;
  priceNote?: string;
}

export const services: Service[] = sluzbyData.services.map((s) => ({
  slug: s.slug,
  title: s.title,
  summary: s.summary,
  detail: opt(s.detail),
  price: opt(s.price),
  priceNote: opt(s.priceNote),
}));

/** Vybavení areálu — používá se na /areal i na homepage. */
export interface Facility {
  name: string;
  size: string;
  text: string;
}

export const facilities: Facility[] = arealData.facilities;
