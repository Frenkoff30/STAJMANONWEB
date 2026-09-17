/**
 * QR Platba jako obrázek pro e-mail.
 *
 * Kód vždy platí jen na účet stáje. Z adresy se bere jen částka,
 * variabilní symbol a splatnost, takže se tudy nedá nic vyčíst ani
 * podvrhnout jiný účet.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { platneDatum } from '@/lib/rezervace';
import { qrPng, spayd } from '@/lib/prihlasky/platba';

export const GET: APIRoute = async ({ url }) => {
  const castka = Number(url.searchParams.get('castka'));
  const vs = url.searchParams.get('vs') ?? '';
  const splatnost = url.searchParams.get('splatnost') ?? '';

  if (!Number.isInteger(castka) || castka < 1 || castka > 1_000_000 || !/^\d{1,10}$/.test(vs)) {
    return new Response('Neplatná platba', { status: 400 });
  }

  const text = spayd({
    castka,
    vs,
    splatnost: platneDatum(splatnost) ? splatnost : undefined,
  });
  if (!text) return new Response('Účet stáje není nastavený', { status: 500 });

  const png = await qrPng(text);

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
