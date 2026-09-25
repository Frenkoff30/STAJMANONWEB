/**
 * Penzion Jízdárna Suchá — ubytování, ceny, občerstvení, okolí.
 * Spravuje redakční systém v `src/obsah/penzion.json`.
 */

import data from '../obsah/penzion.json';

export interface RoomPrice {
  type: string;
  price: string;
  perNote: string;
}

export const rooms: RoomPrice[] = data.rooms;

export interface PetPrice {
  size: string;
  price: string;
}

export const petPolicy: PetPrice[] = data.petPolicy;

export interface Highlight {
  title: string;
  text: string;
}

export const penzionHighlights: Highlight[] = data.highlights;

/** Tipy na výlety v okolí. */
export interface NearbyTip {
  title: string;
  text: string;
  tag: string;
}

export const nearby: NearbyTip[] = data.nearby;
