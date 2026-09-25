export interface NavLink {
  label: string;
  href: string;
  desc?: string;
}

export interface NavGroup {
  label: string;
  href?: string;
  /** Vlaječka pro zvýrazněnou položku v rozbaleném menu. */
  feature?: { title: string; text: string; href: string; cta: string };
  links: NavLink[];
}

export const mainNav: NavGroup[] = [
  {
    label: 'Areál',
    links: [
      {
        label: 'Jízdárna Suchá',
        href: '/areal',
        desc: 'Krytá hala, kolbiště, jízdárna, boxy',
      },
      {
        label: 'Penzion & občerstvení',
        href: '/penzion',
        desc: '24 lůžek, snídaně, terasa nad kolbištěm',
      },
      {
        label: 'Služby',
        href: '/sluzby',
        desc: 'Ustájení, trénink, pronájmy, přeprava',
      },
      {
        label: 'Rezervace jízdáren',
        href: '/rezervace',
        desc: 'Online rozvrh haly a venkovních jízdáren',
      },
    ],
    feature: {
      title: 'Ubytování přímo u kolbiště',
      text: 'Dvoulůžkový pokoj od 940 Kč za osobu a noc včetně vlastní koupelny. Terasa nad kolbištěm, psi vítáni.',
      href: '/penzion',
      cta: 'Rezervovat pobyt',
    },
  },
  {
    label: 'Jezdectví',
    links: [
      {
        label: 'Jezdecká škola',
        href: '/jezdecka-skola',
        desc: 'Celoroční výuka od 7 let, pony i velcí koně',
      },
      {
        label: 'Prázdninové kurzy',
        href: '/kurzy',
        desc: 'Týdenní turnusy pro děti od 8 let, online přihláška',
      },
      {
        label: 'Pobyty s výukou',
        href: '/pobyty',
        desc: 'Velikonoce a podzimní prázdniny',
      },
      {
        label: 'Koně na prodej',
        href: '/kone-na-prodej',
        desc: 'Koně s kvalitní průpravou',
      },
      {
        label: 'Testační odchovna hřebců',
        href: '/odchovna',
        desc: 'Třídění, zkoušky, naskladnění',
      },
    ],
    feature: {
      title: 'Letní turnusy s online přihláškou',
      text: 'Týdenní jezdecké kurzy pro děti od 8 let. Šest lekcí, teorie, celodenní program a plná penze.',
      href: '/kurzy',
      cta: 'Zobrazit turnusy',
    },
  },
  {
    label: 'Sport',
    links: [
      {
        label: 'Kalendář akcí',
        href: '/akce',
        desc: 'Závody, hry pro děti, soustředění',
      },
      {
        label: 'Výsledkové listiny',
        href: '/vysledky',
        desc: 'Archiv výsledků domácích akcí',
      },
      {
        label: 'Úspěchy',
        href: '/uspechy',
        desc: '30 let výsledků na domácích i zahraničních kolbištích',
      },
    ],
    feature: {
      title: 'Velká cena Litomyšle',
      text: 'Vrchol sezóny a 22 let součást extraligy Českého skokového poháru.',
      href: '/akce',
      cta: 'Program sezóny',
    },
  },
  {
    label: 'O nás',
    links: [
      { label: 'Stáj Manon', href: '/o-nas', desc: 'Příběh od roku 1992' },
      { label: 'Jiří Skřivan', href: '/jiri-skrivan', desc: 'Jezdec, trenér, zakladatel ČSP' },
      { label: 'Fotogalerie', href: '/galerie', desc: 'Ze závodů, kurzů i areálu' },
    ],
  },
];

export const footerNav = [
  {
    title: 'Areál',
    links: [
      { label: 'Jízdárna Suchá', href: '/areal' },
      { label: 'Penzion & občerstvení', href: '/penzion' },
      { label: 'Služby a ceník', href: '/sluzby' },
      { label: 'Rezervace jízdáren', href: '/rezervace' },
      { label: 'Fotogalerie', href: '/galerie' },
    ],
  },
  {
    title: 'Pro jezdce',
    links: [
      { label: 'Jezdecká škola', href: '/jezdecka-skola' },
      { label: 'Prázdninové kurzy', href: '/kurzy' },
      { label: 'Pobyty s výukou', href: '/pobyty' },
      { label: 'Koně na prodej', href: '/kone-na-prodej' },
      { label: 'Testační odchovna', href: '/odchovna' },
    ],
  },
  {
    title: 'Sport',
    links: [
      { label: 'Kalendář akcí', href: '/akce' },
      { label: 'Výsledkové listiny', href: '/vysledky' },
      { label: 'Úspěchy stáje', href: '/uspechy' },
      { label: 'Jiří Skřivan', href: '/jiri-skrivan' },
    ],
  },
] as const;
