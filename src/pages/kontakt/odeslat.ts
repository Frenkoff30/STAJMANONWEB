/**
 * Kontaktní formulář.
 *
 * Zprávu pošle stáji přes Resend, stejně jako e-maily k přihláškám (viz
 * src/lib/prihlasky/email.ts — odtud i odesílatel a adresa stáje).
 * Odpověď na e-mail půjde rovnou tomu, kdo formulář vyplnil.
 *
 * S JavaScriptem formulář čeká JSON `{ ok, message }`, bez něj klasický
 * POST a přesměrování zpět na /kontakt.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { emailStaje, odeslatEmail } from '@/lib/prihlasky/email';

/** Formulář vyplněný rychleji než za tolik sekund je téměř jistě robot. */
const MIN_SEKUND = 3;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const POST: APIRoute = async ({ request }) => {
  const chceJson = request.headers.get('x-requested-with')?.toLowerCase() === 'fetch';

  const odpoved = (ok: boolean, message: string, status = 200) =>
    chceJson
      ? new Response(JSON.stringify({ ok, message }), {
          status,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      : new Response(null, {
          status: 303,
          headers: {
            Location: `/kontakt?${ok ? 'odeslano=1' : `chyba=${encodeURIComponent(message)}`}#formular`,
          },
        });

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return odpoved(false, 'Neplatný požadavek.', 400);
  }
  const pole = (klic: string) => String(data.get(klic) ?? '').trim();

  // Honeypot: robot vyplní i skryté pole. Tváříme se, že prošlo.
  if (pole('website')) return odpoved(true, 'Děkujeme, zpráva byla odeslána.');

  const zacatek = Number(pole('ts'));
  if (zacatek > 0 && Date.now() / 1000 - zacatek < MIN_SEKUND) {
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

  const radky: [string, string][] = [
    ['Téma', tema],
    ['Jméno', jmeno],
    ['E-mail', email],
    ['Telefon', telefon || '—'],
  ];

  const odeslano = await odeslatEmail({
    komu: emailStaje,
    odpovedet: email,
    predmet: `[stajmanon.cz] ${tema}: ${jmeno}`,
    text: `Nová zpráva z kontaktního formuláře na stajmanon.cz\n\n${radky
      .map(([k, h]) => `${k}: ${h}`)
      .join('\n')}\n\nZpráva:\n${zprava}\n\nNa tenhle e-mail stačí odpovědět, odpověď půjde přímo odesílateli.`,
    html: `<!doctype html><html lang="cs"><body style="margin:0;padding:24px 12px;background:#f4f0e7"><div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#22312a"><p style="margin:0 0 20px">Nová zpráva z kontaktního formuláře na stajmanon.cz</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 20px">${radky
      .map(
        ([k, h]) =>
          `<tr><td style="padding:6px 16px 6px 0;border-top:1px solid #e6dcc8;color:#3a4a42;font-size:13px;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;border-top:1px solid #e6dcc8">${esc(h)}</td></tr>`,
      )
      .join('')}</table><p style="margin:0 0 20px;white-space:pre-wrap">${esc(zprava)}</p><p style="margin:0;font-size:13px;color:#3a4a42">Na tenhle e-mail stačí odpovědět, odpověď půjde přímo odesílateli.</p></div></body></html>`,
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
