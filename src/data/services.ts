/** Služby stáje a ceník — přepis sluzby.php do strukturovaných dat. */

export interface Service {
  slug: string;
  title: string;
  summary: string;
  detail?: string;
  price?: string;
  priceNote?: string;
}

export const services: Service[] = [
  {
    slug: 'ustajeni',
    title: 'Ustájení koní',
    summary:
      'Boxové ustájení včetně místování, krmení a využívání tréninkových prostor.',
    detail:
      'Možnost spolupráce při výcvikových lekcích. Ostatní služby za poplatek — pouštění do výběhu, dekování. K dispozici venkovní písková jízdárna 25 × 60 m se skokovým materiálem, venkovní kolbiště 60 × 70 m s moderním pískovým povrchem s geotextilií a stálým tréninkovým parkurem a krytá hala 23 × 60 m s osvětlením.',
    price: '12 000 Kč',
    priceNote: 'měsíčně za box · využívání výběhů + 1 000 Kč',
  },
  {
    slug: 'trenink',
    title: 'Trénink koní',
    summary:
      'Boxové ustájení a denní trénink vedený podle individuality koně.',
    detail:
      'Kompletní servis pro koně — profesionální přístup, vyvážené krmení, zajištění kování a veterinární péče. Dle dohody účast na závodech.',
  },
  {
    slug: 'jezdecka-skola',
    title: 'Jezdecká škola',
    summary:
      'Celoroční provoz pro začínající i pokročilé jezdce od 7 let po dospělé.',
    detail:
      'Začínajícím jezdcům nabízíme důsledný základní výcvik na lonži, pokročilejší jezdí ve skupině nebo v individuálních lekcích. Jezdci mohou startovat na domácích akcích, účastnit se skokových a drezurních soustředění a připravit se na ZZVJ.',
  },
  {
    slug: 'prodej-koni',
    title: 'Prodej koní s kvalitní průpravou',
    summary:
      'Rádi s vámi projednáme výběr koně z naší nabídky i prodej koně, který už pro vás není vhodný.',
  },
  {
    slug: 'pronajem-koni',
    title: 'Pronájem koní',
    summary:
      'Koně si lze pronajmout dlouhodobě, na jednotlivé hodiny nebo na soustředění.',
    detail: 'Včetně možnosti následného odkoupení.',
  },
  {
    slug: 'pronajem-treninkovy',
    title: 'Pronájem haly či kolbiště na trénink',
    summary:
      'Přijeďte se svými koňmi i trenérem a pracujte v jiném prostředí. Můžete využít i našeho tréninku.',
    price: '300 Kč',
    priceNote: 'za hodinu a koně · při svícení v hale 400 Kč',
  },
  {
    slug: 'pronajem-akce',
    title: 'Pronájem haly či kolbiště na vaši akci',
    summary:
      'Kolbiště s moderním povrchem a novým překážkovým materiálem, včetně zdi a imitace vodního příkopu.',
  },
  {
    slug: 'pronajem-parkuru',
    title: 'Pronájem parkuru na vaše jezdecké akce',
    summary:
      'Kompletní parkur — 11 nových moderních překážek včetně zdi a imitace vodního příkopu.',
  },
  {
    slug: 'prani-dek',
    title: 'Praní stájových dek a podsedlových deček',
    summary: 'Praní a údržba stájového textilu.',
  },
  {
    slug: 'preprava',
    title: 'Přeprava koní',
    summary: 'Zajistíme přepravu koní na závody i mimo areál.',
  },
];

/** Vybavení areálu — používá se na /areal i na homepage. */
export interface Facility {
  name: string;
  size: string;
  text: string;
}

export const facilities: Facility[] = [
  {
    name: 'Krytá jezdecká hala',
    size: '23 × 66 m',
    text: 'Osvětlená hala s kvalitním povrchem a skokovým materiálem. Umožňuje celoroční provoz jezdecké školy i závodů bez ohledu na počasí.',
  },
  {
    name: 'Venkovní kolbiště',
    size: '60 × 70 m',
    text: 'Moderní pískový povrch s geotextilií a stálý tréninkový parkur. Hlavní kolbiště pro Velkou cenu Litomyšle a domácí závody.',
  },
  {
    name: 'Venkovní jízdárna',
    size: '25 × 60 m',
    text: 'Písková jízdárna včetně skokového materiálu — prostor pro každodenní práci a rozcvičení před startem.',
  },
  {
    name: 'Stáje',
    size: '30 boxů',
    text: 'Boxové ustájení s místováním a krmením, výběhy a pastviny. Postaveno v roce 2007 spolu s halou a penzionem.',
  },
];
