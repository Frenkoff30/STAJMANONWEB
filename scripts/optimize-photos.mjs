/**
 * Zmenší zdrojové fotky v src/assets/photos na rozumnou velikost.
 *
 * Fotky z původního webu jsou nezmenšené snímky z foťáku (až 5472 px, 4 MB).
 * Web z nich nikdy nevyužije víc než ~2560 px, ale Astro originál stejně
 * kopíruje do dist/ — takže build zbytečně bobtná o desítky megabajtů.
 *
 * Spouštět ručně po přidání nových fotek:  node scripts/optimize-photos.mjs
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/assets/photos';
const MAX_WIDTH = 2560;
const SKIP_UNDER = 900 * 1024;

let before = 0;
let after = 0;
let touched = 0;

for (const file of fs.readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f))) {
  const filePath = path.join(DIR, file);
  const size = fs.statSync(filePath).size;
  before += size;

  const meta = await sharp(filePath).metadata();

  if (meta.width <= MAX_WIDTH && size < SKIP_UNDER) {
    after += size;
    continue;
  }

  const buf = await sharp(filePath)
    .rotate()
    .resize({ width: Math.min(meta.width, MAX_WIDTH), withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();

  if (buf.length < size) {
    // Zápis přes dočasný soubor + rename — přímý zápis na OneDrive
    // občas selže (soubor drží synchronizace).
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, buf);
    fs.rmSync(filePath, { force: true });
    fs.renameSync(tmp, filePath);
    after += buf.length;
    touched++;
    console.log(
      `  ${file}  ${meta.width}px ${(size / 1024).toFixed(0)} kB → ` +
        `${Math.min(meta.width, MAX_WIDTH)}px ${(buf.length / 1024).toFixed(0)} kB`,
    );
  } else {
    after += size;
  }
}

console.log(
  `\nZmenšeno ${touched} fotek · ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`,
);
