/**
 * Údaje o firmě podle IČO z ARES (veřejný rejstřík ministerstva financí).
 *
 * Formulář se ptá přes tenhle mezikrok, ne na ARES napřímo: prohlížeč
 * by dotaz na cizí doménu nemusel pustit a stránka by tak nezávisela na
 * tom, jak ARES zrovna nastavil CORS.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { platneIco } from '@/lib/prihlasky/formular';

const json = (data: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  });

export const GET: APIRoute = async ({ url }) => {
  const ico = (url.searchParams.get('ico') ?? '').replace(/\s/g, '');

  if (!platneIco(ico)) {
    return json({ chyba: 'Tohle IČO neexistuje, zkontrolujte ho prosím.' }, 400);
  }

  try {
    const odpoved = await fetch(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) },
    );

    if (odpoved.status === 404) {
      return json({ chyba: 'Firmu s tímhle IČO jsme v ARES nenašli.' }, 404);
    }
    if (!odpoved.ok) throw new Error(`ARES ${odpoved.status}`);

    const data = (await odpoved.json()) as {
      obchodniJmeno?: string;
      dic?: string;
      sidlo?: { textovaAdresa?: string };
    };

    return json(
      {
        nazev: data.obchodniJmeno ?? '',
        adresa: data.sidlo?.textovaAdresa ?? '',
        dic: data.dic ?? '',
      },
      200,
      'public, max-age=3600, s-maxage=86400',
    );
  } catch {
    return json({ chyba: 'ARES teď neodpovídá. Údaje o firmě prosím vyplňte ručně.' }, 502);
  }
};
