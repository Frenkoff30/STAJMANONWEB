/**
 * Formuláře z webu, které jen pošlou e-mail stáji (kontakt, přihláška
 * do jezdecké školy). Odesílá se přes Resend jako e-maily k přihláškám,
 * odpověď na e-mail jde rovnou tomu, kdo formulář vyplnil.
 *
 * Společné je tu i chování odpovědi: s JavaScriptem formulář čeká JSON
 * `{ ok, message }`, bez něj klasický POST a přesměrování zpět na stránku.
 */

import { emailPenzionu, emailStaje, odeslatEmail } from '@/lib/prihlasky/email';

/** Formulář vyplněný rychleji než za tolik sekund je téměř jistě robot. */
const MIN_SEKUND = 3;

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** Odpověď formuláři: JSON pro fetch, přesměrování pro obyčejný POST. */
export function odpovedFormulari(request: Request, zpet: string) {
  const chceJson = request.headers.get('x-requested-with')?.toLowerCase() === 'fetch';

  return (ok: boolean, message: string, status = 200) =>
    chceJson
      ? new Response(JSON.stringify({ ok, message }), {
          status,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      : new Response(null, {
          status: 303,
          headers: {
            Location: `${zpet}?${ok ? 'odeslano=1' : `chyba=${encodeURIComponent(message)}`}#formular`,
          },
        });
}

/**
 * Antispam: vyplněný honeypot (`website`) nebo formulář odeslaný hned
 * po načtení stránky (`ts`). Vrací `robot`, `rychle`, nebo `null`.
 */
export function kontrolaRobota(data: FormData): 'robot' | 'rychle' | null {
  if (String(data.get('website') ?? '').trim()) return 'robot';
  const zacatek = Number(String(data.get('ts') ?? ''));
  if (zacatek > 0 && Date.now() / 1000 - zacatek < MIN_SEKUND) return 'rychle';
  return null;
}

/**
 * Komu patří dotaz podle tématu v kontaktním formuláři.
 *
 * Ubytování vyřizuje penzion ze své vlastní adresy, všechno ostatní chodí
 * stáji. Pobyt s výukou je obojí naráz, tak ho dostanou oba.
 */
export function prijemceTematu(tema: string): string[] {
  if (tema === 'Ubytování v penzionu') return [emailPenzionu];
  if (tema === 'Pobyt s výukou') return [emailStaje, emailPenzionu];
  return [emailStaje];
}

/** Pošle stáji (nebo penzionu) e-mail s tabulkou údajů a textem zprávy. */
export async function poslatStaji(email: {
  predmet: string;
  uvod: string;
  radky: [string, string][];
  zprava?: string;
  odpovedet: string;
  /** Komu zpráva patří. Nevyplněno = stáji. */
  komu?: string | string[];
}): Promise<boolean> {
  const { predmet, uvod, radky, zprava = '', odpovedet, komu = emailStaje } = email;
  const paticka = 'Na tenhle e-mail stačí odpovědět, odpověď půjde přímo odesílateli.';

  return odeslatEmail({
    komu,
    odpovedet,
    predmet,
    text: `${uvod}\n\n${radky.map(([k, h]) => `${k}: ${h}`).join('\n')}${
      zprava ? `\n\nZpráva:\n${zprava}` : ''
    }\n\n${paticka}`,
    html: `<!doctype html><html lang="cs"><body style="margin:0;padding:24px 12px;background:#f4f0e7"><div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#22312a"><p style="margin:0 0 20px">${esc(uvod)}</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 20px">${radky
      .map(
        ([k, h]) =>
          `<tr><td style="padding:6px 16px 6px 0;border-top:1px solid #e6dcc8;color:#3a4a42;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;border-top:1px solid #e6dcc8">${esc(h)}</td></tr>`,
      )
      .join('')}</table>${
      zprava ? `<p style="margin:0 0 20px;white-space:pre-wrap">${esc(zprava)}</p>` : ''
    }<p style="margin:0;font-size:13px;color:#3a4a42">${paticka}</p></div></body></html>`,
  });
}

export { emailPenzionu, emailStaje };
