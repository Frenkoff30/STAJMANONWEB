/**
 * Redakční systém Stáje Manon (Keystatic).
 *
 * Obsah se ukládá jako JSON do `src/obsah/`, fotky do `src/assets/photos/`.
 * Uložení v administraci = commit do repozitáře = automatický build na Vercelu.
 *
 * Lokálně (`npm run dev`) se zapisuje rovnou na disk, na produkci přes GitHub.
 */

import { config, fields, collection, singleton } from '@keystatic/core';
import { foto, odstavec, souborFotky, volitelnyText } from './keystatic.fields';
import {
  strankaAkce,
  strankaAreal,
  strankaGalerie,
  strankaJezdeckaSkola,
  strankaJiriSkrivan,
  strankaKoneNaProdej,
  strankaKontakt,
  strankaKurzy,
  strankaNenalezeno,
  strankaONas,
  strankaOdchovna,
  strankaPenzion,
  strankaPobyty,
  strankaSluzby,
  strankaUspechy,
  strankaUvod,
  strankaVysledky,
} from './keystatic.stranky';

const REPO = 'Frenkoff30/STAJMANONWEB';

/* ---------------------------------------------------------------- kolekce */

const novinky = collection({
  label: 'Novinky',
  path: 'src/obsah/novinky/*',
  format: { data: 'json' },
  slugField: 'title',
  columns: ['title', 'date'],
  entryLayout: 'form',
  schema: {
    title: fields.slug({
      name: { label: 'Nadpis' },
      slug: {
        label: 'Adresa novinky',
        description: 'Doplní se sama z nadpisu. Po zveřejnění ji už neměňte.',
      },
    }),
    date: fields.date({
      label: 'Datum',
      defaultValue: { kind: 'today' },
      validation: { isRequired: true },
    }),
    text: odstavec(
      'Text',
      'Pár vět. Nový odstavec začnete prázdným řádkem. Na úvodní stránce se ukáže jen začátek.',
    ),
    image: fields.image({
      label: 'Fotka',
      directory: 'src/assets/photos/novinky',
      publicPath: '/src/assets/photos/novinky/',
      description: 'Nepovinná. Ideálně na šířku. Ukáže se i při sdílení na Facebooku.',
    }),
    file: fields.file({
      label: 'Soubor ke stažení',
      directory: 'public/soubory/novinky',
      publicPath: '/soubory/novinky/',
      description: 'Nepovinný. Třeba startovní listina, rozpis nebo výsledky.',
    }),
    fileLabel: volitelnyText('Popisek souboru', 'Například: Startovní listiny (XLSX)'),
    link: fields.url({
      label: 'Odkaz',
      description: 'Nepovinný. Třeba na příspěvek na Facebooku nebo na jiný web.',
      validation: { isRequired: false },
    }),
    linkLabel: volitelnyText('Popisek odkazu', 'Například: Fotky na Facebooku'),
  },
});

const vysledky = collection({
  label: 'Výsledkové listiny',
  path: 'src/obsah/vysledky/*',
  format: { data: 'json' },
  slugField: 'title',
  columns: ['title', 'date'],
  entryLayout: 'form',
  schema: {
    title: fields.slug({
      name: { label: 'Název akce' },
      slug: {
        label: 'Adresa záznamu',
        description: 'Interní název souboru, přidejte datum kvůli jedinečnosti.',
      },
    }),
    date: fields.date({ label: 'Datum konání' }),
    file: volitelnyText(
      'Cesta k výsledkové listině',
      'Soubor patří do public/soubory/vysledky/, sem napište /soubory/vysledky/nazev.xlsx',
    ),
  },
});

const uspechy = collection({
  label: 'Úspěchy podle let',
  path: 'src/obsah/uspechy/*',
  format: { data: 'json' },
  slugField: 'year',
  columns: ['year'],
  entryLayout: 'form',
  schema: {
    year: fields.slug({
      name: { label: 'Rok', description: 'Samotné číslo, například 2026.' },
      slug: { label: 'Adresa záznamu' },
    }),
    items: fields.array(
      fields.object({
        place: volitelnyText('Umístění', 'Například 1. nebo 2. U titulů nechte prázdné.'),
        event: fields.text({ label: 'Soutěž' }),
        rider: fields.text({ label: 'Jezdec' }),
        horse: volitelnyText('Kůň'),
        major: fields.checkbox({
          label: 'Titul nebo vítězství v seriálu',
          description: 'Vykreslí se zvýrazněně.',
          defaultValue: false,
        }),
      }),
      {
        label: 'Výsledky',
        itemLabel: (props) =>
          [props.fields.place.value, props.fields.event.value, props.fields.rider.value]
            .filter(Boolean)
            .join(' · '),
      },
    ),
  },
});

const sluzby = singleton({
  label: 'Služby',
  path: 'src/obsah/sluzby',
  format: { data: 'json' },
  schema: {
    services: fields.array(
      fields.object({
        title: fields.text({ label: 'Název služby' }),
        slug: fields.text({
          label: 'Kotva v adrese',
          description:
            'Krátký název bez diakritiky a mezer, například ustajeni. Používá se v odkazu na konkrétní službu.',
        }),
        summary: odstavec('Krátký popis'),
        detail: fields.text({
          label: 'Podrobnosti',
          multiline: true,
          validation: { isRequired: false },
        }),
        price: volitelnyText('Cena', 'Například 12 000 Kč. Prázdné = cena dohodou.'),
        priceNote: volitelnyText('Poznámka k ceně', 'Například: měsíčně za box'),
      }),
      {
        label: 'Nabízené služby',
        description: 'Pořadí se mění přetažením položky.',
        itemLabel: (props) => props.fields.title.value,
      },
    ),
  },
});

const pobyty = collection({
  label: 'Pobyty s výukou',
  path: 'src/obsah/pobyty/*',
  format: { data: 'json' },
  slugField: 'title',
  columns: ['title', 'start'],
  entryLayout: 'form',
  schema: {
    title: fields.slug({ name: { label: 'Název pobytu' } }),
    subtitle: fields.text({ label: 'Podtitul', description: 'Například: Po krůčcích k ZZVJ' }),
    start: fields.date({ label: 'Začátek' }),
    end: fields.date({ label: 'Konec' }),
    dateLabel: fields.text({
      label: 'Termín slovy',
      description: 'Jak se termín vypíše na webu, například 2.–6. dubna 2026',
    }),
    arrival: fields.text({ label: 'Příjezd', description: 'Například: čtvrtek do 18.00' }),
    departure: fields.text({ label: 'Odjezd', description: 'Například: pondělí ve 14.00' }),
    lessons: fields.text({ label: 'Počet lekcí', description: 'Například: 4 výukové lekce' }),
    extras: fields.text({ label: 'Doplňkový program', description: 'Například: návštěva bazénu' }),
    ageFrom: fields.number({ label: 'Věk od', defaultValue: 8, validation: { min: 0 } }),
    description: odstavec('Popis pobytu'),
    price: fields.text({ label: 'Cena', description: 'Například: 7 900 Kč' }),
    priceNotes: fields.array(fields.text({ label: 'Sleva nebo příplatek' }), {
      label: 'Slevy a příplatky',
      itemLabel: (props) => props.value,
    }),
    prihlaska: volitelnyText(
      'Online přihláška',
      'Kód akce ze správy přihlášek, například velikonocni-pobyt-2027. Vyplněný kód změní tlačítko u pobytu na odkaz na formulář. Prázdné = tlačítko otevře e-mail.',
    ),
  },
});

const kone = singleton({
  label: 'Koně na prodej',
  path: 'src/obsah/kone',
  format: { data: 'json' },
  schema: {
    horses: fields.array(
      fields.object({
        name: fields.text({ label: 'Jméno koně' }),
        year: volitelnyText('Ročník narození'),
        breed: volitelnyText('Plemeno'),
        sex: fields.select({
          label: 'Pohlaví',
          options: [
            { label: 'neuvedeno', value: '' },
            { label: 'valach', value: 'valach' },
            { label: 'klisna', value: 'klisna' },
            { label: 'hřebec', value: 'hřebec' },
          ],
          defaultValue: '',
        }),
        description: odstavec('Popis'),
        price: volitelnyText('Cena', 'Prázdné = cena na dotaz.'),
        image: foto('Fotka koně'),
      }),
      {
        label: 'Nabízení koně',
        description:
          'Dokud je seznam prázdný, stránka ukazuje text „právě teď nemáme volného koně".',
        itemLabel: (props) => props.fields.name.value || 'Nový kůň',
      },
    ),
  },
});

const galerie = collection({
  label: 'Fotogalerie',
  path: 'src/obsah/galerie/*',
  format: { data: 'json' },
  slugField: 'alt',
  columns: ['alt', 'tag', 'order'],
  entryLayout: 'form',
  schema: {
    alt: fields.slug({
      name: {
        label: 'Popis fotky',
        description:
          'Co je na fotce vidět. Přečte to hlasová čtečka nevidomým a pomáhá to ve vyhledávání.',
      },
      slug: {
        label: 'Název fotky',
        description:
          'Pod tímto názvem se fotka vybírá na ostatních stránkách. Po nahrání ho už neměňte.',
      },
    }),
    image: souborFotky('Soubor fotky'),
    tag: fields.select({
      label: 'Zařazení',
      options: [
        { label: 'Závody', value: 'zavody' },
        { label: 'Areál', value: 'areal' },
        { label: 'Jezdecká škola', value: 'skola' },
        { label: 'Penzion', value: 'penzion' },
        { label: 'Kurzy pro děti', value: 'kurzy' },
      ],
      defaultValue: 'areal',
    }),
    order: fields.number({
      label: 'Pořadí v galerii',
      description: 'Nižší číslo = dřív. Nechávejte rozestupy po deseti.',
      defaultValue: 100,
      validation: { min: 0 },
    }),
  },
});


/* ------------------------------------------------------------- singletony */

const nastaveni = singleton({
  label: 'Kontakty a údaje',
  path: 'src/obsah/nastaveni',
  format: { data: 'json' },
  schema: {
    name: fields.text({ label: 'Název stáje' }),
    fullName: fields.text({ label: 'Celý název' }),
    tagline: fields.text({ label: 'Podtitul', description: 'Například: Jezdecký areál u Litomyšle' }),
    founded: fields.number({ label: 'Rok založení' }),
    description: odstavec(
      'Popis webu pro vyhledávače',
      'Použije se na úvodní stránce a při sdílení odkazu na sociálních sítích.',
    ),
    address: fields.object(
      {
        street: fields.text({ label: 'Ulice a číslo' }),
        city: fields.text({ label: 'Obec' }),
        zip: fields.text({ label: 'PSČ' }),
        country: fields.text({ label: 'Kód země', description: 'CZ' }),
        countryName: fields.text({ label: 'Země' }),
        lat: fields.number({ label: 'Zeměpisná šířka' }),
        lng: fields.number({ label: 'Zeměpisná délka' }),
        mapUrl: fields.url({ label: 'Odkaz na mapu' }),
        directionsUrl: fields.url({ label: 'Odkaz na navigaci' }),
      },
      { label: 'Adresa' },
    ),
    contacts: fields.array(
      fields.object({
        name: fields.text({ label: 'Jméno' }),
        role: fields.text({ label: 'Co má na starosti' }),
        phone: fields.text({ label: 'Telefon', description: 'Jak se zobrazí: +420 602 451 918' }),
        phoneHref: fields.text({
          label: 'Telefon pro vytáčení',
          description: 'Bez mezer: +420602451918',
        }),
        email: fields.text({ label: 'E-mail' }),
      }),
      { label: 'Kontaktní osoby', itemLabel: (props) => props.fields.name.value },
    ),
    email: fields.text({ label: 'Hlavní e-mail' }),
    emailPenzion: fields.text({ label: 'E-mail penzionu' }),
    phone: fields.text({ label: 'Hlavní telefon' }),
    phoneHref: fields.text({ label: 'Hlavní telefon pro vytáčení' }),
    bankAccount: fields.text({ label: 'Číslo účtu' }),
    bankName: fields.text({ label: 'Banka' }),
    social: fields.object(
      {
        facebook: fields.url({ label: 'Facebook stáje' }),
        facebookKlub: fields.url({ label: 'Facebook jezdeckého klubu' }),
        webKlub: fields.url({
          label: 'Web jezdeckého klubu',
          description:
            'Až bude klub mít vlastní stránky, logo klubu v hlavičce a patičce na ně začne odkazovat. Prázdné = odkazuje se na Facebook klubu.',
        }),
        youtube: fields.url({ label: 'YouTube' }),
      },
      { label: 'Sociální sítě' },
    ),
    keyFacts: fields.array(
      fields.object({
        value: fields.text({ label: 'Číslo', description: 'Například 30 nebo 23 × 66' }),
        label: fields.text({ label: 'Co znamená', description: 'Například: boxů' }),
        note: fields.text({ label: 'Upřesnění' }),
      }),
      {
        label: 'Klíčová čísla',
        description: 'Zobrazují se na úvodní stránce a v sekci o nás.',
        itemLabel: (props) => `${props.fields.value.value} — ${props.fields.label.value}`,
      },
    ),
    partners: fields.array(
      fields.object({
        name: fields.text({ label: 'Název' }),
        url: fields.url({ label: 'Odkaz' }),
      }),
      { label: 'Partneři', itemLabel: (props) => props.fields.name.value },
    ),
    usefulLinks: fields.array(
      fields.object({
        name: fields.text({ label: 'Název' }),
        url: fields.url({ label: 'Odkaz' }),
      }),
      { label: 'Užitečné odkazy', itemLabel: (props) => props.fields.name.value },
    ),
  },
});

const kurzy = singleton({
  label: 'Prázdninové kurzy',
  path: 'src/obsah/kurzy',
  format: { data: 'json' },
  schema: {
    turnusy: fields.array(
      fields.object({
        n: fields.number({ label: 'Číslo turnusu' }),
        nazev: volitelnyText(
          'Název',
          'Vyplňte u pojmenovaných akcí, třeba Jezdecké hry pro děti. Prázdné = vypíše se „3. turnus“.',
        ),
        start: fields.date({ label: 'Začátek' }),
        end: fields.date({
          label: 'Konec',
          description: 'Nechte prázdné u jednodenních akcí.',
          validation: { isRequired: false },
        }),
        status: fields.select({
          label: 'Obsazenost',
          options: [
            { label: 'Volná místa', value: 'volno' },
            { label: 'Poslední místa', value: 'posledni' },
            { label: 'Obsazeno', value: 'obsazeno' },
            { label: 'Uzavřeno', value: 'uzavreno' },
          ],
          defaultValue: 'volno',
        }),
        note: volitelnyText(
          'Poznámka k volným místům',
          'Například: 2 místa + 1 místo s vlastním koněm',
        ),
        prihlaska: volitelnyText(
          'Online přihláška',
          'Kód akce ze správy přihlášek, například letni-tabor-2027. Vyplněný kód změní tlačítko u turnusu na odkaz na formulář. Prázdné = tlačítko otevře e-mail.',
        ),
      }),
      {
        label: 'Turnusy',
        description: 'Obsazenost stačí přepsat u konkrétního turnusu.',
        itemLabel: (props) =>
          props.fields.nazev.value || `${props.fields.n.value}. turnus`,
      },
    ),
    cena: fields.object(
      {
        main: fields.text({ label: 'Základní cena' }),
        discounted: fields.text({ label: 'Zvýhodněná cena' }),
        discountNote: odstavec('Pro koho platí sleva'),
        ownHorse: fields.text({ label: 'Příplatek za vlastního koně' }),
        account: fields.text({ label: 'Číslo účtu pro platbu' }),
      },
      { label: 'Ceník' },
    ),
    program: fields.array(
      fields.object({
        title: fields.text({ label: 'Nadpis' }),
        text: odstavec('Popis'),
      }),
      { label: 'Co kurz obsahuje', itemLabel: (props) => props.fields.title.value },
    ),
    included: fields.array(fields.text({ label: 'Položka' }), {
      label: 'V ceně je zahrnuto',
      itemLabel: (props) => props.value,
    }),
    packing: fields.array(fields.text({ label: 'Položka' }), {
      label: 'Co si vzít s sebou',
      itemLabel: (props) => props.value,
    }),
    storno: fields.array(
      fields.object({
        when: fields.text({ label: 'Kdy' }),
        fee: fields.text({ label: 'Storno poplatek' }),
      }),
      {
        label: 'Storno podmínky',
        itemLabel: (props) => `${props.fields.when.value}: ${props.fields.fee.value}`,
      },
    ),
  },
});

const penzion = singleton({
  label: 'Penzion a okolí',
  path: 'src/obsah/penzion',
  format: { data: 'json' },
  schema: {
    rooms: fields.array(
      fields.object({
        type: fields.text({ label: 'Typ pokoje' }),
        price: fields.text({ label: 'Cena' }),
        perNote: fields.text({ label: 'Za co', description: 'Například: osoba / noc' }),
      }),
      { label: 'Ceník pokojů', itemLabel: (props) => props.fields.type.value },
    ),
    petPolicy: fields.array(
      fields.object({
        size: fields.text({ label: 'Velikost psa' }),
        price: fields.text({ label: 'Cena' }),
      }),
      { label: 'Poplatky za psy', itemLabel: (props) => props.fields.size.value },
    ),
    highlights: fields.array(
      fields.object({
        title: fields.text({ label: 'Nadpis' }),
        text: odstavec('Popis'),
      }),
      { label: 'Co penzion nabízí', itemLabel: (props) => props.fields.title.value },
    ),
    nearby: fields.array(
      fields.object({
        title: fields.text({ label: 'Název místa' }),
        text: odstavec('Popis'),
        tag: fields.text({ label: 'Štítek', description: 'Například: Památky, Příroda, Pro děti' }),
      }),
      { label: 'Tipy na výlety', itemLabel: (props) => props.fields.title.value },
    ),
  },
});

const areal = singleton({
  label: 'Vybavení areálu',
  path: 'src/obsah/areal',
  format: { data: 'json' },
  schema: {
    facilities: fields.array(
      fields.object({
        name: fields.text({ label: 'Název' }),
        size: fields.text({ label: 'Rozměr', description: 'Například 23 × 66 m nebo 30 boxů' }),
        text: odstavec('Popis'),
      }),
      { label: 'Plochy a zázemí', itemLabel: (props) => props.fields.name.value },
    ),
  },
});

const tituly = singleton({
  label: 'Hlavní tituly',
  path: 'src/obsah/tituly',
  format: { data: 'json' },
  schema: {
    items: fields.array(
      fields.object({
        year: fields.text({ label: 'Rok' }),
        text: fields.text({ label: 'Titul' }),
      }),
      {
        label: 'Přehled titulů',
        description:
          'Ručně vybrané největší úspěchy. Zobrazují se na úvodní stránce, v sekci o nás i u Jiřího Skřivana.',
        itemLabel: (props) => `${props.fields.year.value} — ${props.fields.text.value}`,
      },
    ),
  },
});

/* ------------------------------------------------------------------ config */

export default config({
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: REPO },

  ui: {
    brand: { name: 'Stáj Manon' },
    navigation: {
      Novinky: ['novinky'],
      Sport: ['vysledky', 'uspechy', 'tituly'],
      'Pro jezdce': ['kurzy', 'pobyty', 'sluzby', 'kone'],
      'Areál a fotky': ['areal', 'penzion', 'galerie'],
      'Texty stránek': [
        'strankaUvod',
        'strankaAreal',
        'strankaPenzion',
        'strankaSluzby',
        'strankaJezdeckaSkola',
        'strankaKurzy',
        'strankaPobyty',
        'strankaKoneNaProdej',
        'strankaOdchovna',
        'strankaAkce',
        'strankaVysledky',
        'strankaUspechy',
        'strankaONas',
        'strankaJiriSkrivan',
        'strankaGalerie',
        'strankaKontakt',
        'strankaNenalezeno',
      ],
      Web: ['nastaveni'],
    },
  },

  collections: { novinky, vysledky, uspechy, pobyty, galerie },
  singletons: {
    nastaveni,
    kurzy,
    penzion,
    areal,
    tituly,
    sluzby,
    kone,
    strankaUvod,
    strankaAreal,
    strankaPenzion,
    strankaSluzby,
    strankaJezdeckaSkola,
    strankaKurzy,
    strankaPobyty,
    strankaKoneNaProdej,
    strankaOdchovna,
    strankaAkce,
    strankaVysledky,
    strankaUspechy,
    strankaONas,
    strankaJiriSkrivan,
    strankaGalerie,
    strankaKontakt,
    strankaNenalezeno,
  },
});
