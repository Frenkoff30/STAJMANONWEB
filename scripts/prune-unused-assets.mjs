/**
 * Po buildu smaže z _astro nepoužité originály obrázků.
 *
 * Proč: fotogalerie načítá fotky přes `import.meta.glob`, takže Astro do
 * dist/ zkopíruje originál každé z nich — i když stránky odkazují výhradně
 * na vygenerované WebP varianty. Je to ~16 MB souborů, které nikdo nestáhne.
 *
 * Skript maže jen soubory, na které se v žádném HTML / CSS / JS neodkazuje.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * S adaptérem pro Vercel končí statické soubory v .vercel/output/static,
 * bez adaptéru v dist/. Vezmeme tu složku, která existuje.
 */
const DIST = ['.vercel/output/static', 'dist'].find((d) =>
  fs.existsSync(path.join(d, '_astro')),
);

if (!DIST) {
  console.log('Složka s buildem nenalezena — přeskakuji.');
  process.exit(0);
}

const ASSETS = path.join(DIST, '_astro');

/** Posbírá obsah všech textových souborů v dist/. */
function collectText(dir) {
  let out = '';
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out += collectText(full);
    else if (/\.(html|css|js|xml|json|txt)$/i.test(entry.name))
      out += fs.readFileSync(full, 'utf8');
  }
  return out;
}

const haystack = collectText(DIST);

let removed = 0;
let bytes = 0;

for (const file of fs.readdirSync(ASSETS)) {
  if (!/\.(jpe?g|png|gif|tiff?)$/i.test(file)) continue;
  if (haystack.includes(file)) continue;

  const full = path.join(ASSETS, file);
  bytes += fs.statSync(full).size;
  fs.rmSync(full);
  removed++;
}

console.log(
  removed
    ? `Odstraněno ${removed} nepoužitých originálů (${(bytes / 1048576).toFixed(1)} MB).`
    : 'Žádné nepoužité originály k odstranění.',
);
