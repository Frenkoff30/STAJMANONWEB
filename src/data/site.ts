/**
 * Jediný zdroj pravdy pro kontaktní a firemní údaje.
 * Změna se automaticky propíše do hlavičky, patičky, kontaktů i JSON-LD.
 */

export const site = {
  name: 'Stáj Manon',
  fullName: 'Stáj Manon & Areál Jízdárna Suchá',
  tagline: 'Jezdecký areál u Litomyšle',
  url: 'https://www.stajmanon.cz',
  locale: 'cs_CZ',
  founded: 1992,
  description:
    'Sportovní stáj, jezdecká škola a penzion s restaurací v moderním jezdeckém areálu Jízdárna Suchá, 3 km od Litomyšle. Přes 40 jezdeckých akcí ročně, krytá hala 23 × 66 m, ustájení a výcvik od roku 1992.',

  address: {
    street: 'Suchá 1',
    city: 'Suchá u Litomyšle',
    zip: '570 01',
    country: 'CZ',
    countryName: 'Česká republika',
    // Ověřeno přes Nominatim: „Hřebčín Suchá, Suchá, Litomyšl"
    lat: 49.8775,
    lng: 16.3521,
    mapUrl: 'https://mapy.cz/zakladni?q=Jízdárna%20Suchá',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Jízdárna+Suchá,+Suchá+1,+570+01+Litomyšl',
  },

  contacts: [
    {
      name: 'Jiří Skřivan',
      role: 'Stáj Manon — sport, ustájení, prodej koní',
      phone: '+420 602 451 918',
      phoneHref: '+420602451918',
      email: 'manon@wo.cz',
    },
    {
      name: 'Miroslava Skřivanová',
      role: 'Jezdecká škola, kurzy a pobyty pro děti',
      phone: '+420 606 836 449',
      phoneHref: '+420606836449',
      email: 'manon@wo.cz',
    },
    {
      name: 'Penzion Jízdárna Suchá',
      role: 'Rezervace ubytování a restaurace',
      phone: '+420 739 057 775',
      phoneHref: '+420739057775',
      email: 'penzionsucha@email.cz',
    },
  ],

  email: 'manon@wo.cz',
  emailPenzion: 'penzionsucha@email.cz',
  phone: '+420 602 451 918',
  phoneHref: '+420602451918',

  bankAccount: '86-5310227/0100',
  bankName: 'Komerční banka',

  social: {
    facebook: 'https://www.facebook.com/stajmanon.jiriskrivan',
    facebookKlub:
      'https://www.facebook.com/pages/Jezdecký-klub-hřebčín-Suchá/516704915049527',
    youtube: 'http://www.youtube.com/user/stajmanon',
  },
} as const;

/** Klíčová čísla — používají se v hero i v „o nás". */
export const keyFacts = [
  { value: '1992', label: 'založení stáje', note: 'Jiří Skřivan po návratu ze zahraničí' },
  { value: '40+', label: 'akcí ročně', note: 'závody, hry, soustředění, tábory' },
  { value: '23 × 66', label: 'metrů krytá hala', note: 'celoroční provoz s osvětlením' },
  { value: '30', label: 'boxů', note: 'plus výběhy a pastviny' },
] as const;

/** Partneři a odkazy — přeneseno ze starého webu. */
export const partners = [
  { name: 'Národní sportovní agentura', url: 'https://nsa.gov.cz/' },
  { name: 'Energys', url: 'http://www.energys.cz/' },
  { name: 'Kentaur', url: 'http://www.kentaur.cz/' },
  { name: 'Město Litomyšl', url: 'http://www.litomysl.cz' },
  { name: 'Pardubický kraj', url: 'https://www.pardubickykraj.cz/' },
] as const;

export const usefulLinks = [
  { name: 'Český skokový pohár', url: 'http://www.ceskyskokovypohar.cz/' },
  { name: 'Česká jezdecká federace', url: 'http://www.cjf.cz' },
  { name: 'Jezdectví', url: 'http://www.jezdectvi.cz' },
  { name: 'Equichannel', url: 'http://www.equichannel.cz/' },
  { name: 'Svaz chovatelů českého teplokrevníka', url: 'http://www.schct.cz/' },
  { name: 'FEI', url: 'http://www.fei.org' },
] as const;
