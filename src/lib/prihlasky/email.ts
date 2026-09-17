/**
 * E-maily k přihláškám.
 *
 * Odesílá je služba Resend (resend.com). Dokud není nastavená, nic se
 * neposílá a web místo toho ukáže, jak by e-mail vypadal. Přihlášky se
 * ukládají tak jako tak, e-mail je jen upozornění.
 *
 * Každý e-mail se skládá z bloků, ze kterých vzniká HTML i čistý text.
 * Údaje od rodičů se do HTML vždy escapují.
 */

import { site } from '@/data/site';
import { dlouheDatum } from '@/lib/rezervace';
import type { Prihlaska, Tabor } from './db';
import { kc, qrOdkaz, splatnost, terminTaboru, ucetStaje } from './platba';

const apiKlic = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
const od = import.meta.env.PRIHLASKY_EMAIL_OD || process.env.PRIHLASKY_EMAIL_OD || '';

/** Kam chodí upozornění na nové přihlášky a kam rodiče odpovídají. */
export const emailStaje =
  import.meta.env.PRIHLASKY_EMAIL_STAJ || process.env.PRIHLASKY_EMAIL_STAJ || site.email;

export const emailNastaven = Boolean(apiKlic && od);

export interface Email {
  komu: string;
  predmet: string;
  html: string;
  text: string;
}

export type DruhEmailu =
  | 'odeslana'
  | 'staji'
  | 'prijata'
  | 'nahradnik'
  | 'odmitnuta'
  | 'zrusena'
  | 'zaplaceno';

/** Které změny stavu se rodičům oznamují e-mailem. */
export const emailKeStavu: Partial<Record<Prihlaska['stav'], DruhEmailu>> = {
  prijata: 'prijata',
  nahradnik: 'nahradnik',
  odmitnuta: 'odmitnuta',
  zrusena: 'zrusena',
};

/* ------------------------------------------------------------------ odeslání */

export async function odeslatEmail(email: Email): Promise<boolean> {
  if (!emailNastaven) return false;

  try {
    const odpoved = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKlic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: od,
        to: [email.komu],
        reply_to: emailStaje,
        subject: email.predmet,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!odpoved.ok) {
      // Do logu jen stav a hláška služby, žádné údaje z přihlášky.
      console.error('Resend odmítl e-mail', odpoved.status, await odpoved.text());
      return false;
    }
    return true;
  } catch (chyba) {
    console.error('Resend nedostupný', chyba);
    return false;
  }
}

/* ------------------------------------------------------------------ skládání */

type Blok =
  | { typ: 'odstavec'; text: string }
  | { typ: 'nadpis'; text: string }
  | { typ: 'tabulka'; radky: [string, string][] }
  | { typ: 'qr'; src: string; popis: string }
  | { typ: 'odkaz'; text: string; href: string };

const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function slozit(komu: string, predmet: string, bloky: Blok[]): Email {
  const text = bloky
    .map((b) => {
      switch (b.typ) {
        case 'odstavec':
          return b.text;
        case 'nadpis':
          return b.text.toUpperCase();
        case 'tabulka':
          return b.radky.map(([k, h]) => `${k}: ${h}`).join('\n');
        case 'qr':
          return '';
        case 'odkaz':
          return `${b.text}: ${b.href}`;
      }
    })
    .filter(Boolean)
    .join('\n\n');

  const telo = bloky
    .map((b) => {
      switch (b.typ) {
        case 'odstavec':
          return `<p style="margin:0 0 16px">${esc(b.text).replaceAll('\n', '<br>')}</p>`;
        case 'nadpis':
          return `<h2 style="margin:28px 0 12px;font-family:Georgia,serif;font-size:19px;font-weight:normal;color:#16211c">${esc(b.text)}</h2>`;
        case 'tabulka':
          return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">${b.radky
            .map(
              ([k, h]) =>
                `<tr><td style="padding:8px 16px 8px 0;border-top:1px solid #e6dcc8;color:#3a4a42;font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;border-top:1px solid #e6dcc8;color:#16211c;vertical-align:top">${esc(h).replaceAll('\n', '<br>')}</td></tr>`,
            )
            .join('')}</table>`;
        case 'qr':
          return `<p style="margin:8px 0 16px"><img src="${esc(b.src)}" width="180" height="180" alt="${esc(b.popis)}" style="display:block;border:1px solid #e6dcc8"></p><p style="margin:0 0 16px;font-size:13px;color:#3a4a42">${esc(b.popis)}</p>`;
        case 'odkaz':
          return `<p style="margin:8px 0 16px"><a href="${esc(b.href)}" style="display:inline-block;background:#1e3629;color:#fbf9f4;padding:12px 22px;text-decoration:none;font-size:14px;letter-spacing:.04em">${esc(b.text)}</a></p>`;
      }
    })
    .join('');

  const html = `<!doctype html><html lang="cs"><body style="margin:0;background:#f4f0e7;padding:24px 12px"><div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px 28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#22312a"><p style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;color:#16211c">${esc(site.name)}</p>${telo}</div></body></html>`;

  return { komu, predmet, html, text };
}

/** Kontakt pod e-mailem: kdo má na starosti kurzy a pobyty pro děti. */
function podpis(): string {
  const kontakt =
    site.contacts.find((c) => /kurzy|pobyty/i.test(c.role)) ?? site.contacts[0]!;
  return `S pozdravem\n${kontakt.name}, ${site.fullName}\n${kontakt.phone}, ${emailStaje}`;
}

/** Tábor, termín a dítě. Jména se nedají skloňovat, proto do tabulky. */
function kdoKam(tabor: Tabor, p: Prihlaska): [string, string][] {
  return [
    ['Tábor', tabor.nazev],
    ['Termín', terminTaboru(tabor)],
    ['Dítě', p.dite_jmeno],
  ];
}

function shrnuti(tabor: Tabor, p: Prihlaska): [string, string][] {
  return [
    ...kdoKam(tabor, p),
    ['Varianta', `${p.varianta.nazev} (${kc(p.varianta.cena)})`],
    ...p.priplatky.map((x): [string, string] => ['Příplatek', `${x.nazev} (${kc(x.cena)})`]),
    ['Celkem', kc(p.cena)],
    [
      'Platí',
      p.platce === 'firma'
        ? `${p.firma_nazev}, IČO ${p.firma_ico}
faktura na ${p.firma_email}`
        : 'zákonný zástupce převodem',
    ],
    ['Číslo přihlášky', p.vs],
  ];
}

/**
 * Sestaví e-mail daného druhu. `zaklad` je adresa webu (kvůli QR kódu
 * a odkazu do správy).
 *
 * Jména dětí a táborů stojí vždy v 1. pádě (v tabulce nebo za dvojtečkou),
 * věty kolem nich je nepotřebují skloňovat.
 */
export function sestavEmail(
  druh: DruhEmailu,
  tabor: Tabor,
  p: Prihlaska,
  zaklad: string,
): Email {
  const pozdrav: Blok = { typ: 'odstavec', text: 'Dobrý den,' };
  const konec: Blok = { typ: 'odstavec', text: podpis() };

  switch (druh) {
    case 'odeslana':
      return slozit(p.zastupce_email, `Přihláška dorazila: ${tabor.nazev}`, [
        pozdrav,
        {
          typ: 'odstavec',
          text: 'děkujeme, přihláška na tábor dorazila. Teď ji projdeme a do několika dnů vám potvrdíme místo.',
        },
        {
          typ: 'odstavec',
          text: 'Zatím nic neplaťte. Platební údaje pošleme spolu s potvrzením.',
        },
        { typ: 'nadpis', text: 'Shrnutí přihlášky' },
        { typ: 'tabulka', radky: shrnuti(tabor, p) },
        {
          typ: 'odstavec',
          text: 'Kdyby bylo potřeba cokoli změnit, stačí odpovědět na tenhle e-mail.',
        },
        konec,
      ]);

    case 'staji':
      return slozit(emailStaje, `Nová přihláška: ${p.dite_jmeno}, ${tabor.nazev}`, [
        {
          typ: 'odstavec',
          text: 'Přišla nová přihláška na tábor. Místo potvrdíte nebo odmítnete ve správě přihlášek.',
        },
        {
          typ: 'odkaz',
          text: 'Otevřít přihlášku',
          href: new URL(`/prihlasky/sprava/${p.id}`, zaklad).toString(),
        },
        { typ: 'nadpis', text: 'Přihláška' },
        { typ: 'tabulka', radky: shrnuti(tabor, p) },
        { typ: 'nadpis', text: 'Dítě a zástupce' },
        {
          typ: 'tabulka',
          radky: [
            ['Narozeno', dlouheDatum(p.dite_narozeni)],
            ['Zkušenosti', p.dite_zkusenosti || 'neuvedeno'],
            ['Zdraví', p.dite_zdravi || 'bez omezení'],
            ['Zástupce', p.zastupce_jmeno],
            ['Telefon', p.zastupce_telefon],
            ['E-mail', p.zastupce_email],
            ...(p.poznamka ? [['Poznámka', p.poznamka] as [string, string]] : []),
          ],
        },
      ]);

    case 'prijata': {
      const do_ = splatnost(tabor);
      const platba: Blok[] =
        p.platce === 'firma'
          ? [
              {
                typ: 'odstavec',
                text: `Fakturu vystavíme na firmu a pošleme ji na ${p.firma_email}.`,
              },
              {
                typ: 'tabulka',
                radky: [
                  ['Odběratel', `${p.firma_nazev}, IČO ${p.firma_ico}`],
                  ['Částka', kc(p.cena)],
                  ['Splatnost', dlouheDatum(do_)],
                ],
              },
            ]
          : [
              {
                typ: 'tabulka',
                radky: [
                  ['Částka', kc(p.cena)],
                  ['Účet', `${ucetStaje} (${site.bankName})`],
                  ['Variabilní symbol', p.vs],
                  ['Splatnost', dlouheDatum(do_)],
                ],
              },
              {
                typ: 'qr',
                src: qrOdkaz(zaklad, { castka: p.cena, vs: p.vs, splatnost: do_ }),
                popis: 'QR Platba: naskenujte v mobilní bance a údaje se vyplní samy.',
              },
              {
                typ: 'odstavec',
                text: 'Bez včasné platby se místo uvolní dalším zájemcům.',
              },
            ];

      return slozit(p.zastupce_email, `Místo potvrzeno: ${tabor.nazev}`, [
        pozdrav,
        { typ: 'odstavec', text: 's radostí potvrzujeme místo na táboře.' },
        {
          typ: 'tabulka',
          radky: [
            ...kdoKam(tabor, p),
            ...(tabor.nastup ? [['Nástup', tabor.nastup] as [string, string]] : []),
            ...(tabor.odjezd ? [['Odjezd', tabor.odjezd] as [string, string]] : []),
          ],
        },
        { typ: 'nadpis', text: 'Platba' },
        ...platba,
        konec,
      ]);
    }

    case 'nahradnik':
      return slozit(p.zastupce_email, `Jste mezi náhradníky: ${tabor.nazev}`, [
        pozdrav,
        {
          typ: 'odstavec',
          text: 'tábor je teď plně obsazený, přihlášku jsme proto zařadili mezi náhradníky. Jakmile se místo uvolní, hned se ozveme. Zatím prosím nic neplaťte.',
        },
        { typ: 'tabulka', radky: kdoKam(tabor, p) },
        konec,
      ]);

    case 'odmitnuta':
      return slozit(p.zastupce_email, `Přihláška na tábor: ${tabor.nazev}`, [
        pozdrav,
        {
          typ: 'odstavec',
          text: 'je nám líto, ale na tenhle termín už nemáme volné místo. Budeme rádi, když si vyberete jiný.',
        },
        { typ: 'tabulka', radky: kdoKam(tabor, p) },
        konec,
      ]);

    case 'zrusena':
      return slozit(p.zastupce_email, `Přihláška zrušena: ${tabor.nazev}`, [
        pozdrav,
        {
          typ: 'odstavec',
          text: 'přihlášku na tábor jsme zrušili. Pokud jde o omyl, ozvěte se nám prosím.',
        },
        { typ: 'tabulka', radky: kdoKam(tabor, p) },
        konec,
      ]);

    case 'zaplaceno':
      return slozit(p.zastupce_email, `Platba dorazila: ${tabor.nazev}`, [
        pozdrav,
        {
          typ: 'odstavec',
          text: `platba ${kc(p.cena)} dorazila, děkujeme. Místo na táboře je tím definitivně vaše a těšíme se na vás.`,
        },
        { typ: 'tabulka', radky: kdoKam(tabor, p) },
        konec,
      ]);
  }
}
