/** Pobyty s intenzivní výukou jízdy na koni (Velikonoce, podzimní prázdniny). */

export interface Stay {
  slug: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  dateLabel: string;
  arrival: string;
  departure: string;
  lessons: string;
  extras: string;
  ageFrom: number;
  description: string;
  price: string;
  priceNotes: string[];
}

export const stays: Stay[] = [
  {
    slug: 'velikonocni-pobyt',
    title: 'Velikonoční pobyt s výukou jízdy na koni',
    subtitle: 'Po krůčcích k ZZVJ',
    start: '2026-04-02',
    end: '2026-04-06',
    dateLabel: '2.–6. dubna 2026',
    arrival: 'čtvrtek do 18.00',
    departure: 'pondělí ve 14.00',
    lessons: '4 výukové lekce',
    extras: 'návštěva krytého bazénu',
    ageFrom: 8,
    description:
      'Nahlédneme do přípravy na ZZVJ — bezpečný pohyb na jízdárně, předvádění koní, testy, hezké předvedení drezurní úlohy a souhra mezi jezdcem a koněm na malém parkuru. Práci s koňmi si vylepšíme pomocí bariér a přechodů. Pro pokročilejší jezdce je výuka vedena ve vyšší náročnosti. Lekce jsou vždy přizpůsobeny zkušenostem jezdce a program je doplněný o sportovní a společenské hry.',
    price: '7 900 Kč',
    priceNotes: [
      'jezdci na lonži a děti od 10 let — 7 500 Kč',
      'členové JKHS — 7 500 Kč',
      'ustájení vlastního koně — + 800 Kč',
      'lekce je možné dokoupit',
    ],
  },
  {
    slug: 'podzimni-pobyt',
    title: 'Podzimní prázdniny s výukou jízdy na koni',
    subtitle: 'Po krůčcích k ZZVJ',
    start: '2026-10-27',
    end: '2026-11-01',
    dateLabel: '27. října – 1. listopadu 2026',
    arrival: 'úterý do 18.00',
    departure: 'neděle ve 14.00',
    lessons: '5 výukových lekcí',
    extras: 'návštěva Litomyšle + bowling',
    ageFrom: 8,
    description:
      'Zlepšováním techniky sedu a rovnováhy se jezdec může s koněm neustále zlepšovat — a přesně o to nám v této přípravě na ZZVJ půjde. Pro pokročilejší je pobyt vedený ve vyšší náročnosti: obtížnější drezurní úloha, ustupování na holeň v různých variantách, vyšší nároky na skokovou přípravu a malý parkur. Zopakujeme všechny okruhy teorie včetně bezpečného pohybu na jízdárně a předvádění.',
    price: '9 500 Kč',
    priceNotes: [
      'jezdci na lonži a děti do 10 let — 9 000 Kč',
      'členové JKHS — 9 000 Kč',
      'ustájení vlastního koně — + 1 000 Kč',
    ],
  },
];
