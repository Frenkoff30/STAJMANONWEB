# Stáj Manon — web

Redesign webu [stajmanon.cz](http://stajmanon.cz) — sportovní stáj, jezdecká škola
a penzion v areálu Jízdárna Suchá u Litomyšle.

Původní web běžel na PHP se zastaralým rozvržením, Flashovou galerií a obsahem
rozházeným do čtrnácti plochých položek menu. Nový web je **statický** (žádná
databáze, žádný CMS), obsah žije v typovaných datových souborech.

---

## Rychlý start

```bash
npm install
```

```bash
npm run dev
```

Web běží na `http://localhost:4321`.

| Příkaz | Co dělá |
| --- | --- |
| `npm run dev` | vývojový server s hot reloadem |
| `npm run build` | kontrola typů → build do `dist/` → úklid nepoužitých assetů |
| `npm run preview` | lokální náhled produkčního buildu |
| `npm run check` | kontrola typů a Astro diagnostiky |
| `npm run photos` | zmenší nově přidané fotky v `src/assets/photos` na max 2560 px |

---

## Stack

| Vrstva | Volba | Proč |
| --- | --- | --- |
| Framework | **Astro 5** (`output: 'static'`) | Výstupem je čisté HTML — nasadí se na jakýkoli hosting včetně toho stávajícího. Nulový JS tam, kde není potřeba. |
| Styly | **Tailwind CSS 4** | Design tokeny v `@theme`, komponentní třídy v `@layer components`. Žádný config soubor. |
| Jazyk | **TypeScript** (strict) | Data o akcích, kurzech a výsledcích mají schéma — překlep se pozná při buildu, ne až na produkci. |
| Obrázky | `astro:assets` + **sharp** | Automatický převod na WebP, responsivní `srcset`, lazy loading. 50 MB zdrojových fotek → ~2 MB skutečně přenášených dat. |
| Mapa | OpenStreetMap `<iframe>` | Bez API klíče a bez trackovacích cookies. |
| Formulář | jeden PHP skript v `public/` | Funguje na běžném hostingu s `mail()`, i bez JavaScriptu. |

---

## Struktura

```
scripts/               pomocné skripty (zmenšení fotek, úklid buildu)
src/
├── assets/photos/     fotografie (zpracuje je Astro při buildu)
├── components/        Header, Footer, SEO, Lightbox, EventRow, Icon…
├── data/              ★ VEŠKERÝ OBSAH — viz níže
├── layouts/           BaseLayout (shell) + PageLayout (shell s hero fotkou)
├── pages/             jedna .astro = jedna URL
└── styles/global.css  design systém: barvy, typografie, komponentní třídy

public/                kopíruje se 1:1 do dist/
├── soubory/           výsledkové listiny a rozpisy přenesené ze starého webu
├── kontakt-odeslat.php formulář
├── .htaccess          301 přesměrování ze starých .php adres, cache, hlavičky
└── _redirects         totéž pro Netlify / Cloudflare Pages
```

---

## Kde se co edituje

Veškerý obsah je v `src/data/`. Nikde jinde se text upravovat nemusí.

| Soubor | Obsahuje | Jak často se mění |
| --- | --- | --- |
| `site.ts` | kontakty, adresa, telefony, e-maily, sociální sítě, partneři | výjimečně |
| `navigation.ts` | struktura menu a patičky | výjimečně |
| `events.ts` | **kalendář akcí** | průběžně |
| `courses.ts` | prázdninové turnusy, ceny, storno podmínky | 1× ročně + obsazenost |
| `stays.ts` | velikonoční a podzimní pobyt | 1× ročně |
| `accommodation.ts` | ceny pokojů, restaurace, tipy na výlety | podle ceníku |
| `services.ts` | služby, ceník ustájení, parametry ploch | podle ceníku |
| `achievements.ts` | sportovní úspěchy po letech | po sezóně |
| `results.ts` | výsledkové listiny ke stažení | po každé akci |
| `horses.ts` | koně na prodej | podle nabídky |
| `gallery.ts` | popisky (alt texty) a zařazení fotek | při přidání fotek |

### Přidání akce do kalendáře

Jeden řádek v `src/data/events.ts`:

```ts
{ start: '2027-04-10', title: 'Dubnové jezdecké závody', detail: 'hobby, Z–ST, pony', kind: 'zavody' },
```

Stránka `/akce` si sama spočítá, co je nadcházející a co patří do archivu — podle
data buildu. Vícedenní akce mají navíc `end`, vrchol sezóny `highlight: true`,
rozpis ke stažení `file: { label, href }`.

### Přidání výsledkové listiny

1. Soubor nahrát do `public/soubory/vysledky/`
2. Přidat řádek do `src/data/results.ts`:

```ts
{ date: '2027-04-10', title: 'DUBNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2027-04-10-vysledky.xlsx' },
```

Kategorie (jezdecké hry / závody / drezura…) se odvodí z názvu automaticky,
filtry na stránce se doplní samy.

### Změna obsazenosti turnusu

V `src/data/courses.ts` u daného turnusu přepsat `status`:
`'volno' | 'posledni' | 'obsazeno' | 'uzavreno'` a případně `note`.

### Přidání fotky

1. Soubor do `src/assets/photos/` — název ať odpovídá tomu, co je na fotce
   (`kolbiste-*`, `pokoj-*`, `vc-*`, `hala-*`…)
2. Spustit `npm run photos` — zmenší fotku na rozumnou velikost
3. Popisek a kategorii doplnit do `meta` v `src/data/gallery.ts`

Bez záznamu v `meta` se fotka v galerii zobrazí taky, jen s obecným alt textem.

Krok 2 nevynechávejte: fotogalerie načítá složku přes `import.meta.glob`, takže
Astro do buildu kopíruje originál každé fotky. Nezmenšený snímek z foťáku
(5 000 px, 4 MB) tak nafoukne `dist/` o pár megabajtů navíc.

### Koně na prodej

`src/data/horses.ts` — dokud je pole prázdné, stránka ukazuje verzi
„momentálně nemáme volného koně". Po přidání prvního koně se sama přepne
na výpis karet.

---

## Informační architektura

Původních 14 plochých položek menu je seskupených do čtyř oddílů. Zároveň
vznikly dvě nové stránky (`/areal`, `/o-nas`) a rozdělil se obsah, který na
starém webu ležel pod matoucími adresami.

| Nová adresa | Odkud pochází |
| --- | --- |
| `/` | `index.php` / `aktuality.php` |
| `/areal` | nová stránka (zázemí bylo rozeseté po celém webu) |
| `/penzion` | `penzion-jizdarna-sucha.php` |
| `/sluzby` | `sluzby.php` |
| `/jezdecka-skola` | `jezdecky-klub.php` ← na starém webu pod „Jezdecká škola" |
| `/kurzy` | `prazdninove-kurzy.php` |
| `/pobyty` | `jezdecka-skola.php` ← na starém webu pod „Pobyty 2026" |
| `/kone-na-prodej` | `kone-na-prodej.php` |
| `/odchovna` | `testacni-odchovna-hrebcu.php` |
| `/akce` | `akce.php` |
| `/vysledky` | `vysledky.php` |
| `/uspechy` | `uspechy.php` |
| `/o-nas` | `staj-manon.php` |
| `/jiri-skrivan` | `jiri-skrivan.php` |
| `/galerie` | `fotogalerie.php` (Gallery2) |
| `/kontakt` | `kontakt.php` |

Přesměrování ze všech starých adres řeší `public/.htaccess` (Apache) nebo
`public/_redirects` (Netlify). Odkazy zvenčí i pozice ve vyhledávačích tak
zůstanou zachované.

---

## Design

Koncept: **sedlárna**. Papír, sedlová kůže, mosaz, loden zeleň a písek kolbiště.
Editorial rozvržení s velkou fotografií, širokými bílými plochami a vlásečnicovými
linkami místo rámečků a stínů.

| Token | Hodnota | Použití |
| --- | --- | --- |
| `--color-ink` | `#16211c` | text (tmavá zeleň, nikdy čistá černá) |
| `--color-loden-950` | `#101b16` | tmavé sekce |
| `--color-brass-600` | `#a5722d` | akcent, CTA, aktivní stavy |
| `--color-paper` | `#fbf9f4` | pozadí stránky |

**Typografie:** Playfair Display (nadpisy) + Inter (text a UI). Obě mají plnou
podporu české diakritiky.

**Nadpisové třídy** se jmenují `.t-display`, `.t-1`, `.t-2`, `.t-3` — ne `.h-1`
a spol., protože ty by kolidovaly s Tailwind utilitami pro výšku.

**Sekce nemají kickery.** Žádné „TŘI DŮVODY SEM PŘIJET" nad nadpisem ani
dekorativní linky — hierarchii nese samotný headline. Třída `.eyebrow` zůstává
jen pro funkční popisky (patička, karty, tabulky).

### Orientace na dlouhých stránkách

Podstránky mají pod hero lepicí lištu s obsahem (`PageNav`), která zvýrazňuje
sekci, ve které uživatel právě je. Přidá se jedním propem v `PageLayout`:

```astro
<PageLayout
  …
  nav={[
    { id: 'cenik', label: 'Ceník' },
    { id: 'okoli', label: 'Okolí' },
  ]}
  navAction={{ label: 'Rezervovat', href: '#rezervace' }}
>
  <Section id="cenik">…</Section>
```

`id` musí odpovídat `id` sekce na stránce. Lišta se vykreslí až od dvou položek
a na mobilu se posouvá vodorovně.

Skutečnou výšku hlavičky měří JavaScript do proměnné `--header-h`, aby lišta
seděla na pixel a kotvy neschovávaly nadpis pod ní.

### Pohyb při scrollování

Postavené na CSS scroll-driven animacích (`animation-timeline: view()`), takže
běží mimo hlavní vlákno a nestojí ani řádek JavaScriptu. Prohlížeč bez podpory
prostě nic neanimuje a web vypadá normálně.

| Třída | Co dělá | Kam se dává |
| --- | --- | --- |
| `.parallax` | vnitřní obrázek se posouvá pomaleji než stránka | obal fotky v hero a v celoplošných pásech |
| `.reveal-rise` | sekce dojede zespodu | přes prop `rise` na `<Section>` |
| `.reveal-wipe` | obsah se odkryje odspodu | volitelně na jednotlivé bloky |

`.reveal-rise` animuje `transform`, což vytváří containing block. **Nezapínat na
sekcích, které uvnitř mají `position: sticky`** — rozbilo by to lepicí sloupce
na `/o-nas`, `/jiri-skrivan`, `/areal` a úvodní stránce.

Vše respektuje `prefers-reduced-motion`.

### Texty bez pomlček

V textech se nepoužívá dlouhá pomlčka (—). Věty jsou rozdělené čárkou, dvojtečkou
nebo tečkou. Krátká pomlčka (–) zůstává jen v rozsazích, kde nese význam:
`Z–ST`, `2–4lůžkové`, `3.–6. září`, `740–940 Kč`.

### Dlouhé výpisy

Archivy (výsledkové listiny, proběhlé akce, úspěchy po letech) jsou sbalené do
`<details>` — otevřené zůstávají jen nejnovější ročníky. Obsah zůstává celý
v HTML, takže ho najde vyhledávač i Ctrl+F. Na `/vysledky` navíc funguje
fulltext a filtry, které si sbalené roky samy rozbalí.

### Přístupnost

- kontrast textu min. 4,5 : 1 na světlém i tmavém podkladu
- viditelný focus ring (`:focus-visible`) na všech interaktivních prvcích
- odkaz „Přeskočit na obsah" jako první prvek stránky
- dotykové cíle min. 44 × 44 px
- animace respektují `prefers-reduced-motion`
- bez JavaScriptu zůstává veškerý obsah viditelný (`<noscript>` fallback)
- ikony jsou inline SVG s `aria-hidden`, nikoli emoji

---

## Kontaktní formulář

`public/kontakt-odeslat.php` — jediný kus serverového kódu na webu.

- honeypot + časová past proti robotům
- validace na straně serveru, ochrana proti vkládání hlaviček
- s JavaScriptem odesílá `fetch` a vrací JSON, bez JavaScriptu klasický POST
  a přesměrování na `/kontakt?odeslano=1`
- adresa příjemce je konstanta `RECIPIENT` na začátku souboru

**Na statickém hostingu** (Vercel, Netlify, Cloudflare Pages) PHP neběží.
Adresa se proto dá přepnout proměnnými prostředí — kód se nemusí sahat:

```
PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit
PUBLIC_FORM_ACCESS_KEY=<klíč z web3forms.com>
```

Bez nich se použije `/kontakt-odeslat.php`. Formulář zvládne obě odpovědi —
`{ ok, message }` z vlastního PHP i `{ success, message }` z Web3Forms.
Vzor je v `.env.example`.

---

## Nasazení

### Apache hosting (cílový stav)

```bash
npm run build
```

Obsah složky `dist/` nahrát do kořene webu — `.htaccess` se přenese s ním.

1. `src/data/site.ts` → zkontrolovat `url` (kanonická doména v `<link rel=canonical>` a v sitemapě)
2. ověřit, že hosting má zapnuté `mod_rewrite`, `mod_deflate` a `mod_expires`
3. otestovat odeslání formuláře — hosting musí mít funkční `mail()`

### Vercel (náhled pro klienta)

Repozitář stačí připojit, `vercel.json` řeší build, hezké URL, přesměrování ze
starých `.php` adres i bezpečnostní hlavičky. Jen pozor na dvě věci:

- **formulář** — nastavit `PUBLIC_FORM_ENDPOINT` a `PUBLIC_FORM_ACCESS_KEY`
  v *Settings → Environment Variables*, jinak PHP endpoint neodpoví
- **indexace** — u náhledu, který nemá skončit ve vyhledávačích, přidat
  proměnnou `VERCEL_ENV=preview` nebo nasadit na chráněný náhled

---

## Co ještě stojí za doladění

- **Fotky.** Část snímků z původního webu má nízké rozlišení (`pastvina-01`,
  `skola-03`, `boxy-01` mají pod 700 px). Na hero pozicích jsou proto měkčí.
  Novější fotky ve vysokém rozlišení by web viditelně posunuly.
- **Aktuality.** Původní web měl sekci aktualit, která byla dlouhodobě prázdná —
  proto tu není. Kdyby ji stáj chtěla používat, dá se přidat jako `src/data/news.ts`
  se stejným vzorem jako `events.ts`.
- **Cizojazyčné verze.** Staré `/en/` a `/de/` na původním webu nefungovaly.
  Astro má i18n připravené, kdyby byl o překlad zájem.
