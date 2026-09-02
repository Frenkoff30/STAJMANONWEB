/**
 * Sdílená pole redakčního systému.
 *
 * Drží se tu věci, které se opakují na každé stránce: fotka ze společné
 * složky, záhlaví, popisky pro vyhledávače a nadpisy sekcí.
 */

import { fields } from '@keystatic/core';

/**
 * Výběr fotky z Fotogalerie.
 *
 * Fotky se nahrávají na jednom místě, ve Fotogalerii. Všude jinde se na ně
 * jen odkazuje, takže je každá fotka v repozitáři právě jednou a změna
 * popisku se propíše všude.
 */
export const foto = (label: string, isRequired = false) =>
  fields.relationship({
    label,
    collection: 'galerie',
    validation: { isRequired },
    description:
      'Vyberte fotku z Fotogalerie. Novou fotku nahrajete v sekci Fotogalerie.',
  });

/** Nahrání souboru fotky. Používá se jen uvnitř Fotogalerie. */
export const souborFotky = (label: string) =>
  fields.image({
    label,
    directory: 'src/assets/photos',
    publicPath: '/src/assets/photos/',
    validation: { isRequired: true },
    description:
      'Ideálně na šířku, minimálně 2000 px. Web si fotku sám zmenší a převede.',
  });

export const volitelnyText = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: false } });

export const odstavec = (label: string, description?: string) =>
  fields.text({ label, description, multiline: true });

/** Popis fotky pro hlasové čtečky a vyhledávače. */
export const popisFotky = (label = 'Popis fotky pro čtečky') =>
  fields.text({
    label,
    description:
      'Co je na fotce vidět. Přečte to hlasová čtečka nevidomým a pomáhá to ve vyhledávání.',
  });

/** Titulek a popis stránky pro prohlížeč a vyhledávače. */
export const seo = (withDescription = true) =>
  fields.object(
    {
      title: fields.text({
        label: 'Titulek stránky',
        description:
          'Zobrazí se na kartě prohlížeče a jako nadpis ve výsledcích vyhledávání.',
      }),
      ...(withDescription
        ? {
            description: odstavec(
              'Popis pro vyhledávače',
              'Zhruba 150 znaků. Shrnuje, co na stránce návštěvník najde.',
            ),
          }
        : {}),
    },
    { label: 'Vyhledávače a karta prohlížeče' },
  );

/** Záhlaví podstránky: velká fotka, nadpis a úvodní odstavec. */
export const hero = (opts: { lead?: boolean; leadSuffix?: string } = {}) =>
  fields.object(
    {
      heading: fields.text({ label: 'Hlavní nadpis' }),
      ...(opts.lead === false
        ? {}
        : { lead: odstavec('Úvodní odstavec') }),
      ...(opts.leadSuffix
        ? { leadSuffix: odstavec('Text za počtem', opts.leadSuffix) }
        : {}),
      image: foto('Fotka v záhlaví', true),
      imageAlt: popisFotky(),
    },
    { label: 'Záhlaví stránky' },
  );

/** Nadpis a podnadpis jedné sekce. */
export const sekce = (
  label: string,
  opts: { lead?: boolean; action?: boolean } = {},
) =>
  fields.object(
    {
      title: fields.text({ label: 'Nadpis' }),
      ...(opts.lead === false ? {} : { lead: odstavec('Podnadpis') }),
      ...(opts.action ? { actionLabel: fields.text({ label: 'Text odkazu vpravo' }) } : {}),
    },
    { label },
  );

/** Závěrečný blok s výzvou ke kontaktu. */
export const vyzva = (
  buttons: Record<string, string> = {},
  label = 'Závěrečná výzva',
) =>
  fields.object(
    {
      heading: fields.text({ label: 'Nadpis' }),
      lead: odstavec('Text'),
      ...Object.fromEntries(
        Object.entries(buttons).map(([key, l]) => [key, fields.text({ label: l })]),
      ),
    },
    { label },
  );

/** Seznam odstavců s možností **tučného** písma a mezinadpisů. */
export const text = (label: string, description?: string) =>
  fields.array(fields.text({ label: 'Odstavec', multiline: true }), {
    label,
    description:
      (description ? description + ' ' : '') +
      'Tučné písmo se píše mezi dvě hvězdičky: **takto**. Řádek začínající ## je mezinadpis.',
    itemLabel: (props) => props.value.slice(0, 60) || 'Prázdný odstavec',
  });

/** Odrážkový seznam krátkých textů. */
export const seznam = (label: string, itemLabel = 'Položka', description?: string) =>
  fields.array(fields.text({ label: itemLabel }), {
    label,
    description,
    itemLabel: (props) => props.value,
  });

/** Dvojice nadpis + popis, opakovaná ve výpisu. */
export const karty = (
  label: string,
  opts: { href?: boolean; description?: string } = {},
) =>
  fields.array(
    fields.object({
      title: fields.text({ label: 'Nadpis' }),
      text: odstavec('Popis'),
      ...(opts.href
        ? {
            href: fields.text({
              label: 'Odkaz',
              description: 'Adresa na webu, například /penzion',
            }),
          }
        : {}),
    }),
    {
      label,
      description: opts.description ?? 'Pořadí se mění přetažením položky.',
      itemLabel: (props) => props.fields.title.value || 'Bez nadpisu',
    },
  );
