/**
 * Po buildu smaže z dist/_astro nepoužité originály obrázků.
 *
 * Proč: fotogalerie načítá fotky přes `import.meta.glob`, takže Astro do
 * dist/ zkopíruje originál každé z nich — i když stránky odkazují výhradně
 * na vygenerované WebP varianty. Je to ~16 MB souborů, které nikdo nestáhne.
 *
 * Skript maže jen soubory, na které se v žádném HTML / CSS / JS neodkazuje.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const ASSETS = path.join(DIST, '_astro');

if (!fs.existsSync(ASSETS)) {
  console.log('dist/_astro neexistuje — přeskakuji.');
  process.exit(0);
}

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
