/**
 * Přihláška do jezdecké školy. Obyčejný formulář: stáji přijde e-mail
 * s údaji o dítěti a rodiči, odpovědí na něj se stáj ozve rodiči.
 * Termín lekcí se domlouvá až potom, proto tu není ceník ani platba.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import {
  EMAIL,
  emailStaje,
  kontrolaRobota,
  odpovedFormulari,
  poslatStaji,
} from '@/lib/formular-email';
import { formatLong } from '@/data/events';

export const POST: APIRoute = async ({ request }) => {
  const odpoved = odpovedFormulari(request, '/jezdecka-skola');

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return odpoved(false, 'Neplatný požadavek.', 400);
  }
  const pole = (klic: string, max = 200) => String(data.get(klic) ?? '').trim().slice(0, max);

  const robot = kontrolaRobota(data);
  if (robot === 'robot') return odpoved(true, 'Děkujeme, přihláška byla odeslána.');
  if (robot === 'rychle') {
    return odpoved(false, 'Formulář byl odeslán příliš rychle. Zkuste to prosím znovu.', 422);
  }

  const dite = pole('dite', 120);
  const narozeni = pole('narozeni', 10);
  const zkusenosti = pole('zkusenosti', 120);
  const zajem = pole('zajem', 120);
  const rodic = pole('rodic', 120);
  const email = pole('email', 200);
  const telefon = pole('telefon', 40);
  const poznamka = pole('poznamka', 3000);

  const chyby = [
    !dite && 'Vyplňte prosím jméno dítěte.',
    !/^\d{4}-\d{2}-\d{2}$/.test(narozeni) && 'Vyplňte prosím datum narození dítěte.',
    !rodic && 'Vyplňte prosím jméno rodiče.',
    !EMAIL.test(email) && 'Zadejte platnou e-mailovou adresu.',
    telefon.replace(/\D/g, '').length < 9 && 'Vyplňte prosím telefon.',
    /[\r\n]/.test(dite + rodic + email + telefon) && 'Neplatný vstup.',
  ].filter(Boolean);

  if (chyby.length) return odpoved(false, chyby.join(' '), 422);

  const odeslano = await poslatStaji({
    predmet: `[stajmanon.cz] Přihláška do jezdecké školy: ${dite}`,
    uvod: 'Nová přihláška do jezdecké školy z webu stajmanon.cz',
    radky: [
      ['Dítě', dite],
      ['Datum narození', formatLong(narozeni)],
      ['Zkušenosti', zkusenosti || '—'],
      ['Zájem o', zajem || '—'],
      ['Rodič', rodic],
      ['E-mail', email],
      ['Telefon', telefon],
    ],
    zprava: poznamka,
    odpovedet: email,
  });

  if (!odeslano) {
    return odpoved(
      false,
      `Přihlášku se nepodařilo odeslat. Napište nám prosím na ${emailStaje} nebo zavolejte.`,
      502,
    );
  }

  return odpoved(
    true,
    'Děkujeme, přihláška dorazila. Ozveme se vám s termínem lekcí.',
  );
};
