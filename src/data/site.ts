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

  /**
   * Kam odesílá kontaktní formulář.
   *
   * Výchozí je PHP skript v public/ — funguje na běžném hostingu s mail().
   * Na Vercelu PHP neběží, proto se dá přepsat proměnnou prostředí
   * PUBLIC_FORM_ENDPOINT na adresu formulářové služby. Odpověď musí být JSON.
   */
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || '/kontakt-odeslat.php',
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
