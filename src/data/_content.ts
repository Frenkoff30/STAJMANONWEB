/**
 * Společné čtení obsahu, který spravuje redakční systém.
 *
 * Obsah leží v `src/obsah/` jako JSON. Načítá se přes `import.meta.glob`
 * synchronně při buildu, takže datové moduly níž vypadají zvenčí stejně,
 * jako když byly zapsané přímo v TypeScriptu.
 */

/** Prázdný řetězec z formuláře znamená „nevyplněno", ne hodnotu. */
export function opt(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

export interface WithSlug {
  slug: string;
}

/** Načte kolekci a doplní ke každé položce slug podle názvu souboru. */
export function collection<T>(
  modules: Record<string, { default: T }>,
): Array<T & WithSlug> {
  return Object.entries(modules).map(([path, mod]) => ({
    ...mod.default,
    slug: path.split('/').pop()!.replace(/\.json$/, ''),
  }));
}
