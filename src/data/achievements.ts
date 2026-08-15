/**
 * Sportovní úspěchy Stáje Manon.
 *
 * Pozn.: v původním webu byl u roku 1993 omylem zduplikovaný blok výsledků
 * z roku 2011 (Kalisto, Andromeda, Mercedes — koně, kteří v roce 1993
 * neexistovali). Duplicitní řádky zde nejsou.
 */

export interface Achievement {
  /** „1.", „2."… nebo prázdné u titulů */
  place?: string;
  event: string;
  rider: string;
  horse?: string;
  /** Vítězství v seriálu / titul — vykreslí se zvýrazněně */
  major?: boolean;
}

export interface AchievementYear {
  year: number;
  items: Achievement[];
}

export const achievements: AchievementYear[] = [
  {
    year: 2016,
    items: [
      { place: '2.', event: 'ČSP Velká cena Opavy', rider: 'Jiří Skřivan', horse: 'Flying Star' },
      { place: '2.', event: 'MČR družstva', rider: 'Jiří Skřivan ml.', horse: 'Eurydika' },
      { place: '3.', event: 'Styl Šampionát', rider: 'Jiří Skřivan ml.', horse: 'Dius, Jolie' },
      { place: '1. a 3.', event: 'Mistrovství VČO', rider: 'Jiří Skřivan', horse: 'Jolie, Dius' },
    ],
  },
  {
    year: 2012,
    items: [
      { event: 'Finále Českého skokového poháru, 3. místo', rider: 'Jiří Skřivan', horse: 'Kalisto', major: true },
      { place: '1.', event: 'Finále KMK 5letých', rider: 'Jiří Skřivan', horse: 'Eben' },
      { place: '1.', event: 'Velká cena Opavy', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '2.', event: 'ČP Velká cena Martinic', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'ČP Velká cena Brna', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'MČR senioři', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '5.', event: 'ČP Velká cena Ostravy', rider: 'Jiří Skřivan', horse: 'Kalisto' },
    ],
  },
  {
    year: 2011,
    items: [
      { event: 'Vítěz Českého skokového poháru', rider: 'Jiří Skřivan', horse: 'Kalisto', major: true },
      { place: '1.', event: 'Velká cena Ptýrova', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '1.', event: 'Velká cena Opavy', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'Velká cena Kolína', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'Velká cena Ostravy', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'DaJ Junior Cup Kolín', rider: 'Petra Skřivanová', horse: 'Andromeda' },
      { place: '4.', event: 'Velká cena Brna', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '4.', event: 'Velká cena Ostravy', rider: 'Jiří Skřivan', horse: 'Mercedes' },
      { place: '5.', event: 'MČR Ptýrov, senioři', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '5.', event: 'MČR Ptýrov, mladí jezdci', rider: 'Petra Skřivanová', horse: 'Andromeda' },
      { place: '7.', event: 'Grand Prix Linec', rider: 'Jiří Skřivan', horse: 'Kalisto' },
    ],
  },
  {
    year: 2010,
    items: [
      { event: 'Mistryně ČR mladých jezdců', rider: 'Petra Skřivanová', horse: 'Odyssea', major: true },
      { place: '1.', event: 'Velká cena Ptýrova', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '2.', event: 'Malá cena Plzně', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'ČSP Velká cena Plzně', rider: 'Jiří Skřivan', horse: 'Mercedes 1' },
      { place: '3.', event: 'Finále DaJ Czech Junior Cup', rider: 'Mirka Skřivanová', horse: 'Kalisto' },
      { place: '5.', event: 'ČSP Velká cena Všemil', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '8.', event: 'ČSP Velká cena Prahy', rider: 'Petra Skřivanová', horse: 'Odyssea' },
    ],
  },
  {
    year: 2009,
    items: [
      { place: '1.', event: 'MČR družstev', rider: 'Jiří Skřivan', horse: 'Kalisto', major: true },
      { place: '1.', event: 'Dance and Jump Czech Junior Cup Kolín', rider: 'Mirka Skřivanová', horse: 'Mary Ann' },
      { place: '1.', event: 'Audi Christmas Masters', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '1.', event: 'ST Dubicko', rider: 'Jiří Skřivan', horse: 'Mercedes' },
      { place: '1.', event: 'S Brno', rider: 'Mirka Skřivanová', horse: 'Mary Ann' },
      { place: '1.', event: 'ST+T Nová Amerika', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '2.', event: 'Velká cena Opavy', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '2.', event: 'Velká cena Jemčiny', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '2.', event: 'S Hradišťko', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'Malá cena Plzně', rider: 'Jiří Skřivan', horse: 'Kalisto' },
      { place: '3.', event: 'S Hradišťko', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '4.', event: 'Velká cena Prahy', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '4.', event: 'Finále Dance and Jump Praha', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '4.', event: 'S Hradišťko', rider: 'Mirka Skřivanová', horse: 'Mary Ann' },
      { place: '5.', event: 'Grand Prix Wiener Neustadt, Rakousko', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '6.', event: 'MČR juniorů', rider: 'Petra Skřivanová', horse: 'Odyssea' },
    ],
  },
  {
    year: 2008,
    items: [
      { place: '2.', event: 'Finále Dance and Jump Czech Junior Cup', rider: 'Petra Skřivanová', horse: 'Odyssea' },
      { place: '3.', event: 'Dance and Jump Czech Junior Cup v Kolíně', rider: 'Mirka Skřivanová', horse: 'Labe James CAC Leasing' },
    ],
  },
  {
    year: 2007,
    items: [
      { place: '1.', event: 'Mistrovství VČO', rider: 'Mirka Skřivanová', horse: 'Labe James CAC Leasing' },
      { place: '2.', event: 'Mistrovství VČO', rider: 'Petra Skřivanová', horse: 'Excalibur Wepol' },
      { place: '2.', event: 'Mistrovství VČO', rider: 'Mirka Skřivanová', horse: 'Mary Ann' },
      { place: '3.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '4.', event: 'MČR juniorů', rider: 'Mirka Skřivanová', horse: 'Labe James CAC Leasing' },
      { place: '4.', event: 'MČR juniorů', rider: 'Petra Skřivanová', horse: 'Ramara Elkor' },
    ],
  },
  {
    year: 2006,
    items: [
      { event: 'Vítěz Českého skokového poháru', rider: 'Jiří Skřivan', major: true },
      { place: '1.', event: 'ČSOB Velká cena Prahy', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '1.', event: 'ČSOB Velká cena Brna', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '1.', event: 'Cena Karsit', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '2.', event: 'MČR družstva', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '2.', event: 'Malá cena Plzně', rider: 'Jiří Skřivan', horse: 'Tora 1' },
      { place: '2.', event: 'Malá cena Brna', rider: 'Jiří Skřivan', horse: 'Excalibur Wepol' },
      { place: '3.', event: 'Grand Prix Leszno, Polsko', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '3.', event: 'MČR juniorů', rider: 'Mirka Skřivanová', horse: 'Rafaela' },
      { place: '4.', event: 'ČSOB Velká cena Zámku Belcredi', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '5.', event: 'ČSOB Velká cena Ostravy', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '5.', event: 'MČR juniorů', rider: 'Petra Skřivanová', horse: 'Tora 1' },
      { place: '6.', event: 'Mittel Tour', rider: 'Jiří Skřivan', horse: 'Ramara Elkor' },
    ],
  },
  {
    year: 2005,
    items: [
      { place: '1.', event: 'Velká cena Prahy', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '3.', event: 'Finále KMK 6letých', rider: 'Jiří Skřivan', horse: 'Tora 1' },
      { place: '4.', event: 'Velká cena Brna', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
    ],
  },
  {
    year: 2004,
    items: [
      { event: 'Vítěz Českého skokového poháru', rider: 'Jiří Skřivan', major: true },
      { place: '1.', event: 'Velká cena Frenštátu pod Radhoštěm', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '2.', event: 'Velká cena Prahy', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '3.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Andolph Wepol' },
      { place: '3.', event: 'Velká cena Frenštátu pod Radhoštěm', rider: 'Jiří Skřivan', horse: 'Rytma CAC Leasing' },
      { place: '4.', event: 'Velká cena Brna', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
    ],
  },
  {
    year: 2003,
    items: [
      { place: '1.', event: 'Velká cena Ostravy', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '1.', event: 'Velká cena Poděbrad', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '1.', event: 'Velká cena Plzně', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '1.', event: 'Velká cena Frenštátu pod Radhoštěm', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '3.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
    ],
  },
  {
    year: 2000,
    items: [{ place: '2.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' }],
  },
  {
    year: 1999,
    items: [{ place: '2.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' }],
  },
  {
    year: 1998,
    items: [
      { place: '1.', event: 'Velká cena Poděbrad', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
      { place: '4.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe James CAC Leasing' },
    ],
  },
  {
    year: 1997,
    items: [{ place: '2.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe Jeff' }],
  },
  {
    year: 1996,
    items: [
      { place: '1.', event: 'Grand Prix CSI Hortobágy, Maďarsko', rider: 'Jiří Skřivan', horse: 'Labe Jeff', major: true },
      { place: '1.', event: 'Grand Prix CSA Poděbrady', rider: 'Jiří Skřivan', horse: 'Labe Jeff' },
      { place: '2.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Labe Jeff' },
    ],
  },
  {
    year: 1994,
    items: [
      { place: '1.', event: 'MČR mladých koní', rider: 'Jiří Skřivan', horse: 'Labe Jeff' },
      { place: '1.', event: 'KMK 6letých', rider: 'Jiří Skřivan', horse: 'Labe Jeff' },
      { place: '3.', event: 'MČR', rider: 'Jiří Skřivan', horse: 'Vesta del Metz' },
    ],
  },
  {
    year: 1993,
    items: [
      { place: '1.', event: 'Mistr ČR', rider: 'Jiří Skřivan', horse: 'Vesta del Metz', major: true },
    ],
  },
];

/** Zkratkový přehled do hero sekce / o nás. */
export const majorTitles = [
  { year: '1993', text: 'Mistr ČR v parkurovém skákání' },
  { year: '2004', text: 'Vítěz Českého skokového poháru' },
  { year: '2006', text: 'Vítěz Českého skokového poháru' },
  { year: '2010', text: 'Mistryně ČR mladých jezdců, Petra Skřivanová' },
  { year: '2011', text: 'Vítěz Českého skokového poháru' },
];
