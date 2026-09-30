/**
 * Jediný zdroj pravdy pro kontaktní a firemní údaje.
 * Změna v `src/obsah/nastaveni.json` se propíše do hlavičky, patičky,
 * kontaktů i strukturovaných dat pro vyhledávače.
 */

import data from '../obsah/nastaveni.json';

export const site = {
  ...data,
  url: 'https://www.stajmanon.cz',
  locale: 'cs_CZ',

  /** Kam odesílá kontaktní formulář — src/pages/kontakt/odeslat.ts (přes Resend). */
  formEndpoint: '/kontakt/odeslat',
} as const;

/** Klíčová čísla — používají se v hero i v „o nás". */
export const keyFacts: ReadonlyArray<{
  value: string;
  label: string;
  note: string;
}> = data.keyFacts;

/** Partneři a odkazy. */
export const partners: ReadonlyArray<{ name: string; url: string }> =
  data.partners;

export const usefulLinks: ReadonlyArray<{ name: string; url: string }> =
  data.usefulLinks;
