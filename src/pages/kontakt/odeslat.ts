/**
 * Kontaktní formulář. Zprávu pošle stáji e-mailem (src/lib/formular-email.ts).
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import {
  EMAIL,
  emailStaje,
  kontrolaRobota,
  odpovedFormulari,
  poslatStaji,
  prijemceTematu,
} from '@/lib/formular-email';

export const POST: APIRoute = async ({ request }) => {
  const odpoved = odpovedFormulari(request, '/kontakt');

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return odpoved(false, 'Neplatný požadavek.', 400);
  }
  const pole = (klic: string) => String(data.get(klic) ?? '').trim();

  // Robotovi se tváříme, že prošlo.
  const robot = kontrolaRobota(data);
  if (robot === 'robot') return odpoved(true, 'Děkujeme, zpráva byla odeslána.');
  if (robot === 'rychle') {
    return odpoved(false, 'Formulář byl odeslán příliš rychle. Zkuste to prosím znovu.', 422);
  }

  const jmeno = pole('name');
  const email = pole('email');
  const telefon = pole('phone');
  const tema = pole('topic') || 'Obecný dotaz';
  const zprava = pole('message');

  const chyby = [
    (!jmeno || jmeno.length > 120) && 'Vyplňte prosím jméno.',
    !EMAIL.test(email) && 'Zadejte platnou e-mailovou adresu.',
    zprava.length < 5 && 'Napište nám prosím, o co jde.',
    zprava.length > 5000 && 'Zpráva je příliš dlouhá.',
    /[\r\n]/.test(jmeno + email + telefon + tema) && 'Neplatný vstup.',
  ].filter(Boolean);

  if (chyby.length) return odpoved(false, chyby.join(' '), 422);

  const odeslano = await poslatStaji({
    predmet: `[stajmanon.cz] ${tema}: ${jmeno}`,
    uvod: 'Nová zpráva z kontaktního formuláře na stajmanon.cz',
    radky: [
      ['Téma', tema],
      ['Jméno', jmeno],
      ['E-mail', email],
      ['Telefon', telefon || '—'],
    ],
    zprava,
    odpovedet: email,
    komu: prijemceTematu(tema),
  });

  if (!odeslano) {
    return odpoved(
      false,
      `Zprávu se nepodařilo odeslat. Napište nám prosím přímo na ${emailStaje}.`,
      502,
    );
  }

  return odpoved(true, 'Děkujeme, zpráva byla odeslána. Ozveme se v nejkratším možném čase.');
};
