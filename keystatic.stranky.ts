/**
 * Texty jednotlivých stránek webu.
 *
 * Jedna položka = jedna stránka. Obsah leží v `src/obsah/stranky/`.
 * Struktura polí musí odpovídat tomu, co stránka v `src/pages/` čte —
 * když se tady přidá pole, musí se doplnit i do stránky, jinak se nikde
 * nezobrazí.
 */

import { fields, singleton } from '@keystatic/core';
import {
  foto,
  hero,
  karty,
  odstavec,
  popisFotky,
  sekce,
  seo,
  seznam,
  text,
  vyzva,
} from './keystatic.fields';

const stranka = (label: string, schema: Parameters<typeof singleton>[0]['schema'], soubor: string) =>
  singleton({
    label,
    path: `src/obsah/stranky/${soubor}`,
    format: { data: 'json' },
    schema,
  });

/* ------------------------------------------------------------ úvodní strana */

const odkaz = (label: string) =>
  fields.object(
    {
      label: fields.text({ label: 'Text tlačítka' }),
      href: fields.text({ label: 'Odkaz', description: 'Například /penzion' }),
    },
    { label },
  );

export const strankaUvod = stranka(
  'Úvodní stránka',
  {
    seo: seo(false),
    hero: fields.object(
      {
        image: foto('Fotka přes celou obrazovku', true),
        imageAlt: popisFotky(),
        headingStart: fields.text({
          label: 'Nadpis, první část',
          description: 'Vypíše se před zvýrazněné slovo.',
        }),
        headingAccent: fields.text({
          label: 'Zvýrazněné slovo',
          description: 'Vysází se kurzivou v mosazné barvě.',
        }),
        headingEnd: fields.text({ label: 'Nadpis, zbytek' }),
        lead: odstavec('Úvodní odstavec'),
        primaryCta: odkaz('Hlavní tlačítko'),
        secondaryCta: odkaz('Vedlejší tlačítko'),
        quickNews: fields.object(
          {
            label: fields.text({ label: 'Popisek' }),
            href: fields.text({ label: 'Odkaz' }),
            fallback: fields.text({ label: 'Text, když není žádná novinka' }),
          },
          { label: 'Lišta: nejnovější novinka' },
        ),
        quickCourses: odkaz('Lišta: prázdninové kurzy'),
        quickEvents: fields.object(
          {
            label: fields.text({ label: 'Popisek' }),
            href: fields.text({ label: 'Odkaz' }),
            fallback: fields.text({
              label: 'Text, když není naplánovaná akce',
            }),
          },
          { label: 'Lišta: nejbližší akce' },
        ),
      },
      { label: 'Úvodní obrazovka' },
    ),
    pillarsIntro: fields.object(
      {
        heading: odstavec('Nadpis', 'Odřádkováním rozdělíte nadpis na dva řádky.'),
        lead: odstavec('Text'),
        linkLabel: fields.text({ label: 'Text odkazu' }),
        linkHref: fields.text({ label: 'Odkaz' }),
      },
      { label: 'Tři důvody: úvod' },
    ),
    pillars: fields.array(
      fields.object({
        title: fields.text({ label: 'Nadpis' }),
        text: odstavec('Popis'),
        href: fields.text({ label: 'Odkaz' }),
        cta: fields.text({ label: 'Text odkazu' }),
      }),
      {
        label: 'Tři důvody',
        description: 'Pořadí na stránce se mění přetažením.',
        itemLabel: (props) => props.fields.title.value || 'Bez nadpisu',
      },
    ),
    calendar: fields.object(
      {
        title: fields.text({ label: 'Nadpis' }),
        lead: odstavec('Text'),
        actionLabel: fields.text({ label: 'Text odkazu vpravo' }),
      },
      { label: 'Nejbližší akce' },
    ),
    penzion: fields.object(
      {
        image: foto('Fotka', true),
        imageAlt: popisFotky(),
        title: fields.text({ label: 'Nadpis' }),
        lead: odstavec('Text'),
        primaryCta: odkaz('Hlavní tlačítko'),
        secondaryCtaLabel: fields.text({
          label: 'Text tlačítka na e-mail',
          description: 'Odkazuje na e-mail penzionu z Kontaktů a údajů.',
        }),
      },
      { label: 'Pás o penzionu' },
    ),
    skola: fields.object(
      {
        title: fields.text({ label: 'Nadpis' }),
        lead: odstavec('Text'),
        items: karty('Nabídka výuky', { href: true }),
        imageTall: foto('Fotka na výšku', true),
        imageTallAlt: popisFotky(),
      },
      { label: 'Pás o jezdecké škole' },
    ),
    uspechy: fields.object(
      {
        image: foto('Fotka', true),
        imageAlt: popisFotky(),
        title: fields.text({ label: 'Nadpis' }),
        text: odstavec('Text'),
        primaryCtaLabel: fields.text({ label: 'Text prvního tlačítka' }),
        secondaryCtaLabel: fields.text({ label: 'Text druhého tlačítka' }),
      },
      { label: 'Pás o úspěších' },
    ),
    cta: fields.object(
      {
        heading: odstavec('Nadpis', 'Odřádkováním rozdělíte nadpis na dva řádky.'),
        lead: odstavec('Text'),
        buttonLabel: fields.text({ label: 'Text tlačítka' }),
      },
      { label: 'Závěrečná výzva' },
    ),
  },
  'uvod',
);

/* ------------------------------------------------------------- podstránky */

export const strankaAreal = stranka(
  'Areál – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        coTuNajdete: sekce('Sekce: parametry'),
        odUsedlostiKArealu: sekce('Sekce: historie'),
        kdeNasNajdete: sekce('Sekce: mapa', { lead: false }),
      },
      { label: 'Nadpisy sekcí' },
    ),
    timeline: fields.array(
      fields.object({
        year: fields.text({ label: 'Rok' }),
        title: fields.text({ label: 'Nadpis' }),
        text: odstavec('Popis'),
      }),
      { label: 'Historie areálu', itemLabel: (props) => `${props.fields.year.value} — ${props.fields.title.value}` },
    ),
    mapa: fields.object(
      {
        placeName: fields.text({ label: 'Název místa' }),
        notes: seznam('Poznámky u adresy', 'Poznámka', 'První dostane ikonu špendlíku, další ikonu domu.'),
        buttonLabel: fields.text({ label: 'Text tlačítka do navigace' }),
      },
      { label: 'Adresa u mapy' },
    ),
    odkazy: karty('Odkazy na konci stránky', { href: true }),
  },
  'areal',
);

export const strankaPenzion = stranka(
  'Penzion – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        ubytovaniVKliduKousek: sekce('Sekce: co penzion nabízí'),
        cenyUbytovani: sekce('Sekce: ceník'),
        jakToUNas: sekce('Sekce: fotky'),
        litomyslskoNaMalemUzemi: sekce('Sekce: okolí'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    images: fields.object(
      {
        pokoj: foto('Fotka pokoje', true),
        pokojAlt: popisFotky(),
        restaurace: foto('Fotka klubovny s občerstvením', true),
        restauraceAlt: popisFotky(),
        terasa: foto('Fotka terasy', true),
        terasaAlt: popisFotky(),
        okoli: foto('Fotka k sekci okolí', true),
        okoliAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    psi: fields.object(
      {
        title: fields.text({ label: 'Nadpis' }),
        text: fields.text({ label: 'Text nad ceníkem' }),
      },
      { label: 'Rámeček o psech' },
    ),
    cta: vyzva({ buttonLabel: 'Text tlačítka na formulář' }),
  },
  'penzion',
);

export const strankaSluzby = stranka(
  'Služby – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        coProVasUdelame: sekce('Sekce: výpis služeb'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    cta: vyzva({ buttonLabel: 'Text tlačítka na formulář' }),
  },
  'sluzby',
);

export const strankaJezdeckaSkola = stranka(
  'Jezdecká škola – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        krokZaKrokemK: sekce('Sekce: jak výuka probíhá'),
        naTomhleNesetrime: sekce('Sekce: bezpečnost', { lead: false }),
        cenik: sekce('Sekce: ceník'),
        klubZaTimVsim: sekce('Sekce: jezdecký klub'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    steps: karty('Kroky výuky', {
      description: 'Číslování 01, 02… doplní web sám podle pořadí.',
    }),
    cenik: fields.object(
      {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Název položky' }),
            price: fields.text({ label: 'Cena', description: 'Například 650 Kč' }),
            note: fields.text({ label: 'Za co', description: 'Například: za lekci' }),
            text: odstavec('Popis'),
          }),
          {
            label: 'Položky ceníku',
            description: 'Pořadí se mění přetažením položky.',
            itemLabel: (props) =>
              `${props.fields.title.value} — ${props.fields.price.value}`,
          },
        ),
        note: odstavec('Poznámka pod ceníkem'),
      },
      { label: 'Ceník jezdecké školy' },
    ),
    klubActivities: seznam('Co klub nabízí', 'Činnost'),
    images: fields.object(
      {
        lekce: foto('Fotka u výuky', true),
        lekceAlt: popisFotky(),
        bezpecnost: foto('Fotka u bezpečnosti', true),
        bezpecnostAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    bezpecnostText: odstavec('Úvodní text u bezpečnosti'),
    bezpecnostSeznam: seznam('Výčet u bezpečnosti', 'Položka'),
    bezpecnostNote: odstavec('Poznámka u bezpečnosti'),
    klubText: text('Text o jezdeckém klubu'),
    odkazy: karty('Odkazy na navazující nabídku', {
      href: true,
      description: 'Tři dlaždice pod jezdeckým klubem. Pořadí se mění přetažením.',
    }),
    cta: vyzva(),
  },
  'jezdecka-skola',
);

export const strankaKurzy = stranka(
  'Prázdninové kurzy – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        terminy: sekce('Sekce: termíny', { lead: false }),
        tydenZeKterehoSi: sekce('Sekce: program'),
        coSiZabalit: sekce('Sekce: co s sebou'),
        kolikToStoji: sekce('Sekce: cena', { lead: false }),
      },
      { label: 'Nadpisy sekcí' },
    ),
    images: fields.object(
      {
        program: foto('Fotka u programu', true),
        programAlt: popisFotky(),
        pokoj: foto('Fotka u seznamu věcí', true),
        pokojAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    terminyNote: fields.object(
      {
        before: fields.text({ label: 'Text před e-mailem' }),
        after: fields.text({ label: 'Text za e-mailem' }),
      },
      { label: 'Věta pod termíny' },
    ),
    programNote: odstavec('Poznámka pod programem'),
    cenaLabels: fields.object(
      {
        main: fields.text({ label: 'Popisek základní ceny' }),
        discounted: fields.text({ label: 'Popisek zvýhodněné ceny' }),
      },
      { label: 'Popisky u cen' },
    ),
    cenaNotes: fields.object(
      {
        ownHorseLabel: fields.text({ label: 'Vlastní kůň: tučný začátek' }),
        ownHorseText: odstavec('Vlastní kůň: zbytek věty', 'Navazuje na částku z Prázdninových kurzů.'),
        paymentLabel: fields.text({ label: 'Platba: tučný začátek' }),
        paymentBefore: fields.text({ label: 'Platba: text před číslem účtu' }),
        paymentAfter: odstavec('Platba: text za číslem účtu'),
        insuranceLabel: fields.text({ label: 'Pojištění: tučný začátek' }),
        insuranceText: odstavec('Pojištění: text'),
      },
      { label: 'Podmínky pod ceníkem' },
    ),
    boxTitles: fields.object(
      {
        included: fields.text({ label: 'Nadpis rámečku s cenou' }),
        storno: fields.text({ label: 'Nadpis rámečku se stornem' }),
      },
      { label: 'Nadpisy rámečků' },
    ),
    stornoNote: odstavec('Poznámka pod stornem'),
    odpovednaOsoba: fields.object(
      {
        label: fields.text({ label: 'Tučný začátek' }),
        name: fields.text({ label: 'Jméno' }),
        phone: fields.text({ label: 'Telefon, jak se zobrazí' }),
        phoneHref: fields.text({ label: 'Telefon pro vytáčení', description: 'Bez mezer.' }),
        after: odstavec('Text za e-mailem'),
      },
      { label: 'Odpovědná osoba' },
    ),
    cta: vyzva({ primaryLabel: 'Text tlačítka na e-mail' }),
  },
  'kurzy',
);

export const strankaPobyty = stranka(
  'Pobyty – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      { dvaTerminyMimoPrazdniny: sekce('Sekce: výpis pobytů') },
      { label: 'Nadpisy sekcí' },
    ),
    cta: vyzva({ secondaryLabel: 'Text druhého tlačítka' }),
  },
  'pobyty',
);

export const strankaKoneNaProdej = stranka(
  'Koně na prodej – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      { praveTedNemameVolneho: sekce('Sekce: když není žádný kůň') },
      { label: 'Nadpisy sekcí' },
    ),
    pribeh: text('Text, když není žádný kůň'),
    kontaktLabel: fields.text({ label: 'Text tlačítka na kontakt' }),
    ocekavani: fields.object(
      {
        title: fields.text({ label: 'Nadpis rámečku' }),
        items: karty('Body v rámečku'),
      },
      { label: 'Rámeček „co od nás můžete čekat“' },
    ),
    cta: vyzva({
      primaryLabel: 'Text prvního tlačítka',
      secondaryLabel: 'Text druhého tlačítka',
    }),
  },
  'kone-na-prodej',
);

export const strankaOdchovna = stranka(
  'Testační odchovna – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        kdyAKde: sekce('Sekce: termíny'),
        coMusiHrebecMit: sekce('Sekce: podmínky'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    requirements: karty('Podmínky pro nástup'),
    prazdno: odstavec('Text, když nejsou žádné termíny'),
    cta: vyzva({ secondaryLabel: 'Text druhého tlačítka' }),
  },
  'odchovna',
);

export const strankaAkce = stranka(
  'Kalendář akcí – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        coNasCeka: sekce('Sekce: nadcházející'),
        probehleAkce: sekce('Sekce: archiv', { action: true }),
      },
      { label: 'Nadpisy sekcí' },
    ),
    vrchol: fields.object(
      {
        lead: odstavec('Text', 'Nadpis a termín se berou z akce označené jako vrchol sezóny.'),
        place: fields.text({ label: 'Místo konání' }),
      },
      { label: 'Pás s vrcholem sezóny' },
    ),
    prazdno: odstavec('Text, když není naplánovaná žádná akce'),
    druhy: fields.object(
      { title: fields.text({ label: 'Nadpis' }) },
      { label: 'Sekce: jaké akce pořádáme' },
    ),
    cta: vyzva({
      primaryLabel: 'Text prvního tlačítka',
      secondaryLabel: 'Text druhého tlačítka',
    }),
  },
  'akce',
);

export const strankaVysledky = stranka(
  'Výsledkové listiny – texty',
  {
    seo: seo(),
    hero: hero({ lead: false, leadSuffix: 'Doplní se za počet listin.' }),
    sekce: fields.object(
      { prohledejteArchiv: sekce('Sekce: archiv') },
      { label: 'Nadpisy sekcí' },
    ),
    prazdno: odstavec('Text, když filtry nic nenajdou'),
    cta: fields.object(
      {
        heading: fields.text({ label: 'Nadpis' }),
        lead: odstavec('Text'),
        buttonLabel: fields.text({ label: 'Text tlačítka' }),
        buttonHref: fields.url({ label: 'Odkaz tlačítka' }),
      },
      { label: 'Odkaz na Český skokový pohár' },
    ),
  },
  'vysledky',
);

export const strankaUspechy = stranka(
  'Úspěchy – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        rokPoRoce: sekce('Sekce: přehled po letech'),
        titulyKtereSePocitaji: sekce('Sekce: milníky', { lead: false }),
      },
      { label: 'Nadpisy sekcí' },
    ),
    souhrn: fields.object(
      {
        labelTotal: fields.text({ label: 'Popisek u počtu umístění' }),
        labelWins: fields.text({ label: 'Popisek u počtu vítězství' }),
        extraValue: fields.text({ label: 'Třetí údaj' }),
        extraLabel: fields.text({ label: 'Popisek třetího údaje' }),
        note: odstavec('Poznámka pod čísly'),
      },
      { label: 'Souhrn v číslech' },
    ),
    images: fields.object(
      {
        portrait: foto('Fotka u milníků', true),
        portraitAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    cta: vyzva({ buttonLabel: 'Text tlačítka' }),
  },
  'uspechy',
);

export const strankaONas = stranka(
  'O nás – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        statekStajAreal: sekce('Sekce: příběh', { lead: false }),
        ctyriVeciKtereTu: sekce('Sekce: co děláme', { lead: false }),
      },
      { label: 'Nadpisy sekcí' },
    ),
    pribeh: text('Příběh stáje'),
    pribehButtons: fields.object(
      {
        primary: fields.text({ label: 'Text prvního tlačítka' }),
        secondary: fields.text({ label: 'Text druhého tlačítka' }),
      },
      { label: 'Tlačítka pod příběhem' },
    ),
    images: fields.object(
      {
        areal: foto('Velká fotka', true),
        arealAlt: popisFotky(),
        staj: foto('Malá fotka vlevo', true),
        stajAlt: popisFotky(),
        klub: foto('Malá fotka vpravo', true),
        klubAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    cinnosti: karty('Čtyři činnosti', { href: true }),
    citat: fields.object(
      {
        text: odstavec('Citát'),
        linkLabel: fields.text({ label: 'Text odkazu pod citátem' }),
      },
      { label: 'Citát o jménu stáje' },
    ),
  },
  'o-nas',
);

export const strankaJiriSkrivan = stranka(
  'Jiří Skřivan – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        odJuniorskychMedailiPo: sekce('Sekce: životopis', { lead: false }),
        nejvyznamnejsiTituly: sekce('Sekce: milníky', { lead: false }),
        jezdeckaRodinaSkrivanova: sekce('Sekce: rodina'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    facts: fields.array(
      fields.object({
        label: fields.text({ label: 'Údaj' }),
        value: fields.text({ label: 'Hodnota' }),
      }),
      { label: 'Údaje u portrétu', itemLabel: (props) => props.fields.label.value },
    ),
    pribeh: text('Životopis'),
    images: fields.object(
      {
        portrait: foto('Portrét', true),
        portraitAlt: popisFotky(),
        sport: foto('Fotka u milníků', true),
        sportAlt: popisFotky(),
      },
      { label: 'Fotky na stránce' },
    ),
    milnikyLinkLabel: fields.text({ label: 'Text odkazu pod milníky' }),
    family: fields.array(
      fields.object({
        name: fields.text({ label: 'Jméno' }),
        role: fields.text({ label: 'Role' }),
        text: odstavec('Popis'),
      }),
      { label: 'Rodina', itemLabel: (props) => props.fields.name.value },
    ),
  },
  'jiri-skrivan',
);

export const strankaGalerie = stranka(
  'Fotogalerie – texty',
  {
    seo: seo(),
    hero: hero({ lead: false, leadSuffix: 'Doplní se za počet fotek.' }),
    sekce: fields.object(
      { prohledneteSiAreal: sekce('Sekce: galerie') },
      { label: 'Nadpisy sekcí' },
    ),
    cta: vyzva({}, 'Odkaz na sociální sítě'),
  },
  'galerie',
);

export const strankaKontakt = stranka(
  'Kontakt – texty',
  {
    seo: seo(),
    hero: hero(),
    sekce: fields.object(
      {
        kontakty: sekce('Sekce: kontakty', { lead: false }),
        najdeteNasTriKilometry: sekce('Sekce: mapa'),
      },
      { label: 'Nadpisy sekcí' },
    ),
    adresa: fields.object(
      {
        label: fields.text({ label: 'Popisek nad adresou' }),
        placeName: fields.text({ label: 'Název místa' }),
        linkLabel: fields.text({ label: 'Text odkazu do navigace' }),
      },
      { label: 'Adresa' },
    ),
  },
  'kontakt',
);

export const strankaNenalezeno = stranka(
  'Stránka nenalezena (chyba 404)',
  {
    seo: seo(),
    heading: fields.text({ label: 'Nadpis' }),
    lead: odstavec('Text'),
    primaryLabel: fields.text({ label: 'Text prvního tlačítka' }),
    secondaryLabel: fields.text({ label: 'Text druhého tlačítka' }),
    helpBefore: fields.text({ label: 'Text před telefonem' }),
    helpMiddle: fields.text({ label: 'Text mezi telefonem a e-mailem' }),
  },
  'nenalezeno',
);
