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
| Framework | **Astro 5**, statický výstup | Všechny stránky jsou předgenerované HTML. Serverová je jen administrace. Nulový JS tam, kde není potřeba. |
| Styly | **Tailwind CSS 4** | Design tokeny v `@theme`, komponentní třídy v `@layer components`. Žádný config soubor. |
| Jazyk | **TypeScript** (strict) | Data o akcích, kurzech a výsledcích mají schéma — překlep se pozná při buildu, ne až na produkci. |
| Obrázky | `astro:assets` + **sharp** | Automatický převod na WebP, responsivní `srcset`, lazy loading. 50 MB zdrojových fotek → ~2 MB skutečně přenášených dat. |
| Mapa | OpenStreetMap `<iframe>` | Bez API klíče a bez trackovacích cookies. |
| Redakční systém | **Keystatic** | Administrace na `/keystatic`, obsah jako JSON v repozitáři. Žádná databáze, žádný měsíční poplatek, obsah je verzovaný v gitu. |
| Rezervace | **Supabase** (Postgres + Auth) | Jediná část webu s databází. Přihlašování a pravidla „kdo co smí" hlídá databáze, ne prohlížeč. |
| Hosting | **Vercel** (`@astrojs/vercel`) | Uložení v administraci = commit = automatický build. |
| Formulář | jeden PHP skript v `public/` | Funguje na běžném hostingu s `mail()`, i bez JavaScriptu. Na Vercelu se přepne na formulářovou službu. |

---

## Struktura

```
keystatic.config.ts    definice redakčního systému (kolekce, singletony)
supabase/schema.sql    databáze rezervací: tabulky, pravidla, kontroly
keystatic.fields.ts    sdílená pole (fotka, záhlaví, nadpis sekce…)
keystatic.stranky.ts   pole pro texty jednotlivých stránek
scripts/               pomocné skripty (zmenšení fotek, úklid buildu)
src/
├── assets/photos/     ★ knihovna fotek, jedna složka na fotku
├── components/        Header, Footer, SEO, Lightbox, EventRow, Prose…
├── data/              čtecí vrstva nad obsahem + pomocné funkce
├── layouts/           BaseLayout (shell) + PageLayout (shell s hero fotkou)
├── lib/               připojení k Supabase a logika rezervací
├── middleware.ts      přihlášený člověk a hlídání přístupu k /rezervace
├── obsah/             ★ VEŠKERÝ OBSAH, spravuje ho redakční systém
├── pages/             jedna .astro = jedna URL
└── styles/global.css  design systém: barvy, typografie, komponentní třídy

public/                kopíruje se 1:1 do buildu
├── soubory/           výsledkové listiny a rozpisy přenesené ze starého webu
├── kontakt-odeslat.php formulář
├── .htaccess          301 přesměrování ze starých .php adres, cache, hlavičky
└── _redirects         totéž pro Netlify / Cloudflare Pages
```

---

## Redakční systém

Administrace běží na **`/keystatic`** ([Keystatic](https://keystatic.com)).
Není za ní žádná databáze: co se v ní uloží, se zapíše jako commit do
repozitáře a Vercel z něj postaví nový web. Změna je online do dvou minut.

```bash
npm run dev
```

Lokálně pak administrace běží na `http://localhost:4321/keystatic` a zapisuje
rovnou na disk, bez přihlašování.

### Co jde upravovat

| Sekce v administraci | Co obsahuje | Kde to leží |
| --- | --- | --- |
| **Kalendář akcí** | jednotlivé závody, hry, soustředění, rozpisy ke stažení | `src/obsah/akce/` |
| **Výsledkové listiny** | archiv výsledků od roku 2012 | `src/obsah/vysledky/` |
| **Úspěchy podle let** | sportovní výsledky po ročnících | `src/obsah/uspechy/` |
| **Hlavní tituly** | ručně vybraný přehled do hero sekcí | `src/obsah/tituly.json` |
| **Prázdninové kurzy** | turnusy, obsazenost, ceník, program, storno | `src/obsah/kurzy.json` |
| **Pobyty s výukou** | velikonoční a podzimní pobyt | `src/obsah/pobyty/` |
| **Služby** | ustájení, trénink, pronájmy, ceny | `src/obsah/sluzby.json` |
| **Koně na prodej** | nabídka koní i s fotkami | `src/obsah/kone.json` |
| **Vybavení areálu** | hala, kolbiště, jízdárna, boxy | `src/obsah/areal.json` |
| **Penzion a okolí** | ceník pokojů, psi, vybavení, tipy na výlety | `src/obsah/penzion.json` |
| **Fotogalerie** | knihovna fotek celého webu | `src/obsah/galerie/` |
| **Texty stránek** | nadpisy, odstavce, tlačítka a fotky všech 17 stránek | `src/obsah/stranky/` |
| **Kontakty a údaje** | telefony, e-maily, adresa, sociální sítě, partneři | `src/obsah/nastaveni.json` |

V kódu zůstává jen to, co by se úpravou dalo rozbít: struktura menu
(`src/data/navigation.ts`), rozvržení stránek a design.

### Fotky

Fotogalerie je zároveň **knihovna fotek pro celý web**. Každá fotka je
v repozitáři právě jednou, ve vlastní složce:

```
src/assets/photos/vc-skok/image.jpg
```

Nová fotka se nahrává jedině ve Fotogalerii (popis, zařazení, pořadí).
Na ostatních stránkách se pak vybírá z rozbalovacího seznamu podle názvu.
Díky tomu se jedna fotka nekopíruje na deset míst a změna popisku platí všude.

Astro si z originálu vygeneruje WebP varianty pro různé šířky obrazovky, takže
nahrávat se dá rovnou snímek z foťáku. Po hromadném přidání většího množství
fotek se hodí spustit `npm run photos`, který originály zmenší na 2560 px.

### Delší texty

Příběh stáje, medailon Jiřího Skřivana a podobné bloky se v administraci píšou
jako seznam odstavců. Formátování je záměrně minimální:

| Zápis | Výsledek |
| --- | --- |
| `**text**` | **tučně** |
| `## Nadpis` | mezinadpis uvnitř textu |

Nic jiného se neinterpretuje, HTML se vypíše doslova. Zajišťuje to komponenta
`src/components/Prose.astro`.

### Přidání akce do kalendáře

V administraci *Kalendář akcí → New*. Vyplní se název, datum, typ akce a
volitelně upřesnění nebo rozpis ke stažení. Stránka `/akce` si sama spočítá,
co je nadcházející a co patří do archivu, podle data buildu.

U opakujících se akcí (*Zimní skoková příprava*) je potřeba v poli
**Adresa záznamu** doplnit datum, aby byl název souboru jedinečný.

### Přidání výsledkové listiny

1. Soubor nahrát do `public/soubory/vysledky/` (přes GitHub nebo od vývojáře)
2. V administraci *Výsledkové listiny → New*, do pole **Cesta k listině**
   napsat `/soubory/vysledky/nazev.xlsx`

Kategorie (jezdecké hry / závody / drezura…) se odvodí z názvu automaticky,
filtry na stránce se doplní samy.

### Změna obsazenosti turnusu

*Prázdninové kurzy → Turnusy*, u konkrétního turnusu přepsat **Obsazenost**
a případně **Poznámku k volným místům**.

### Koně na prodej

*Koně na prodej*. Dokud je seznam prázdný, stránka ukazuje verzi
„momentálně nemáme volného koně". Po přidání prvního koně se sama přepne
na výpis karet.

---

## Jak je to postavené uvnitř

Obsah je JSON v `src/obsah/`. Moduly v `src/data/` ho načítají přes
`import.meta.glob` a doplňují k němu logiku, kterou redaktor řešit nemusí:
řazení akcí podle data, rozdělení na nadcházející a archiv, odvození kategorie
výsledků z názvu, dopočet souhrnných čísel.

Stránky v `src/pages/` pak čtou hotová data. Díky tomu má každý text v
administraci jasné místo a přidání akce nevyžaduje sáhnout do kódu.

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
| `/rezervace` | nová stránka (rozvrh jízdáren, dřív tabulka v Google Sheets) |

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
dekorativní linky, hierarchii nese samotný headline. Třída `.eyebrow` zůstává
jen pro funkční popisky (patička, karty, tabulky).

**Žádné rámečky, žádné číslování.** Přehledy údajů (parametry areálu, ceny,
okolí, klíčová čísla) jsou sloupce oddělené vlásečnicí nad každou položkou,
ne mřížka orámovaných čtverců. Stejně tak seznamy nemají ozdobné číslice
01, 02, 03: pořadí nese samotné řazení. Výjimkou je přepínač jízdáren
v rezervacích, kde výplň označuje vybranou položku, tedy nese informaci.

```html
<!-- takhle ano -->
<dl class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
  <div class="border-t border-ink/12 pt-5">…</div>
</dl>
```

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

## Rezervace jízdáren

Na `/rezervace` běží týdenní rozvrh tří jízdáren. Je to jediná část webu
s databází: obsah zbytku webu žije v gitu, ale rezervace se mění každou
hodinu a musí být vidět okamžitě.

| Vrstva | Volba | Proč |
| --- | --- | --- |
| Databáze | **Supabase** (PostgreSQL) | Zdarma pro tuhle velikost, zálohy a přihlašování v jednom. |
| Přihlašování | **Supabase Auth** | Hashování hesel, potvrzovací e-maily, reset hesla a omezení počtu pokusů jsou hotové a odladěné. Vlastní přihlašování je nejčastější místo, kde se web dá prolomit. |
| Pravidla | **Row Level Security** v databázi | Kdo co smí, rozhoduje databáze. Web je jen okno do ní. |
| Stránky | Astro s `prerender: false` | Zbytek webu zůstává statický, serverové je jen `/rezervace/*`. |

### Kdo co vidí

| | Kalendář | Jména jezdců | Rezervovat |
| --- | --- | --- | --- |
| Kdokoli | ano | ne | ne |
| Přihlášený, neschválený | ano | ne | ne |
| Schválený člen | ano | ano | ano |
| Správce | ano | ano | ano + administrace |

Účet vzniká ve dvou krocích: člověk se zaregistruje a potvrdí e-mail, pak ho
ještě musí schválit stáj v `/rezervace/sprava`. Do té doby rozvrh jen vidí.

### Jak to spustit (jednorázově)

1. **Založit projekt** na [supabase.com](https://supabase.com), region Frankfurt.
2. **Vytvořit tabulky.** V Supabase *SQL Editor → New query* vložit celý obsah
   `supabase/schema.sql` a spustit. Skript jde pustit i podruhé, nic nesmaže.
3. **Nastavit proměnné** ve Vercelu (*Settings → Environment Variables*) a
   lokálně v `.env`:

   | Proměnná | Kde ji vzít |
   | --- | --- |
   | `SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `SUPABASE_ANON_KEY` | tamtéž, klíč `anon` / `public` |

4. **Upravit e-mailové šablony.** Supabase → *Authentication → Email Templates*.
   V šablonách *Confirm signup* a *Reset password* nahradit odkaz za:

   ```
   {{ .SiteURL }}/rezervace/potvrdit?token_hash={{ .TokenHash }}&type=signup
   ```

   (u obnovy hesla `type=recovery`). Bez téhle úpravy odkaz funguje jen
   v prohlížeči, ve kterém registrace začala, což lidem otevírajícím e-mail
   na mobilu nevyjde.

5. **Povolit adresu webu.** Supabase → *Authentication → URL Configuration*,
   do *Site URL* dát `https://www.stajmanon.cz` a do *Redirect URLs* přidat
   `https://www.stajmanon.cz/rezervace/potvrdit`.
6. **Zaregistrovat se** na `/rezervace/registrace` a z prvního účtu udělat
   správce. V SQL editoru:

   ```sql
   update public.profily set role = 'spravce', schvaleno = true
   where id = (select id from auth.users where email = 'vas@email.cz');
   ```

Dokud proměnné chybí, stránka `/rezervace` se jen omluví, že se systém
spouští. Zbytek webu funguje dál, build nespadne.

### Co se spravuje na webu

`/rezervace/sprava`, vidí ji jen správce:

| Sekce | Co dělá |
| --- | --- |
| **Čeká na schválení** | pustí nového jezdce k rezervacím |
| **Členové** | pozastavení člena, jmenování dalšího správce |
| **Zavřené termíny** | závody, soustředění, údržba. Zavřený termín nejde rezervovat a v kalendáři je u něj vidět důvod |
| **Oznámení** | hláška nad kalendářem pro všechny |
| **Pravidla** | jak daleko dopředu jde rezervovat, kolik rezervací smí mít člen, do kdy jde rušit |

Jízdárny, jejich kapacity a časové sloty jsou v `supabase/schema.sql`.
Mění je vývojář, protože změna kapacity se dotkne už uložených rezervací.

Výchozí stav odpovídá rozpisu, na který je stáj zvyklá:

| Jízdárna | Kapacita |
| --- | --- |
| Krytá hala | 5 jezdců |
| Venkovní jízdárna | 2 jezdci |
| Venkovní malá jízdárna | 2 jezdci |

Časy: 6:30–8:30, 8:30–9:00 a pak po hodině až do 21:00.

### Proč se tomu dá věřit

Bezpečnost neleží v šablonách, ale v databázi. I kdyby někdo web obešel
a mluvil s databází přímo, platí pořád totéž:

- **Rezervovat může jen schválený člen.** Kontroluje to pravidlo RLS
  i trigger `rezervace_kontrola`.
- **Rezervovat jde jen sám za sebe.** Vlastník rezervace se bere
  z přihlášení, ne z formuláře. Poslat cizí id nikam nevede.
- **Kapacita se nedá přebookovat.** Dva lidé, kteří kliknou na poslední místo
  ve stejnou chvíli, se v databázi seřadí za sebe (`pg_advisory_xact_lock`)
  a druhý dostane hlášku, že je obsazeno.
- **Do minulosti ani přes blokaci se nerezervuje.**
- **Jména jezdců nepřihlášený nedostane.** Rozhoduje o tom funkce
  `kalendar()` v databázi, ne šablona.
- **Roli ani schválení si nikdo nepřepíše.** Trigger `profil_chran_prava`
  vrátí obě hodnoty zpět každému, kdo není správce.
- **Poslední správce nemůže přijít o práva**, jinak by se do administrace
  už nikdo nedostal.
- **Přihlašovací token je v cookie `httpOnly`**, takže se k němu JavaScript
  na stránce nedostane.
- **Odhlášení a všechny zápisy jdou přes POST** a Astro odmítne požadavek
  z cizí domény (`security.checkOrigin`).
- **Stránky rezervací se neukládají do mezipaměti**, aby se po odhlášení
  nedal tlačítkem zpět zobrazit cizí kalendář.

### Kde co leží

```
supabase/schema.sql             tabulky, pravidla RLS, kontroly, výchozí data
src/lib/supabase.ts             připojení k databázi, překlad chybových hlášek
src/lib/rezervace.ts            počítání s datem a časem, skloňování
src/middleware.ts               načtení přihlášeného člověka, hlídání přístupu
src/layouts/RezervaceLayout.astro
src/components/rezervace/       kalendář, lišta účtu, hlášky
src/pages/rezervace/
├── index.astro                 týdenní kalendář
├── nova.astro                  potvrzení a zrušení jednoho termínu
├── moje.astro                  moje rezervace a údaje
├── sprava.astro                administrace
├── prihlaseni.astro, registrace.astro, odhlaseni.ts
├── zapomenute-heslo.astro, nove-heslo.astro
└── potvrdit.ts                 cíl odkazů z e-mailů
```

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

Web je statický: všech 17 stránek se předgeneruje při buildu. Serverové jsou
jen dvě věci, administrace (`/keystatic`, `/api/keystatic`) a rezervace
jízdáren (`/rezervace/*`).

### Vercel

Repozitář stačí připojit. `vercel.json` řeší přesměrování ze starých `.php`
adres a bezpečnostní hlavičky, zbytek zajistí adaptér `@astrojs/vercel`.

**Proměnné prostředí** (*Settings → Environment Variables*):

| Proměnná | K čemu |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | přihlášení do administrace přes GitHub |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | tamtéž |
| `KEYSTATIC_SECRET` | podepisování přihlašovací session |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | název GitHub App |
| `PUBLIC_FORM_ENDPOINT` | kam odesílat kontaktní formulář |
| `PUBLIC_FORM_ACCESS_KEY` | klíč formulářové služby |
| `SUPABASE_URL` | databáze rezervací |
| `SUPABASE_ANON_KEY` | tamtéž, veřejný klíč |

### Zprovoznění administrace (jednorázově)

1. Nasadit web na Vercel a nastavit vlastní doménu
2. Otevřít `https://<doména>/keystatic/setup` — průvodce založí GitHub App
   a vypíše hodnoty pro čtyři proměnné `KEYSTATIC_*`
3. Vyplnit je ve Vercelu a spustit nový deploy
4. Přidat lidi ze stáje jako spolupracovníky repozitáře — bez toho se
   do administrace přihlásí, ale nebudou moct ukládat

Repozitář je v `keystatic.config.ts` nastavený konstantou `REPO`. Při
přesunu pod jiný GitHub účet je potřeba ji přepsat.

### Apache hosting

Pokud by web měl běžet na běžném hostingu s PHP, administrace ani rezervace
tam fungovat nebudou (obojí potřebuje serverovou část). Web samotný ano: stačí z
`astro.config.mjs` odebrat adaptér, spustit `npm run build` a nahrát obsah
`dist/`. Obsah by se pak upravoval jen lokálně přes `npm run dev`.

---

## Co ještě stojí za doladění

- **Fotky.** Část snímků z původního webu má nízké rozlišení (`pastvina-01`,
  `skola-03`, `boxy-01` mají pod 700 px). Na hero pozicích jsou proto měkčí.
  Novější fotky ve vysokém rozlišení by web viditelně posunuly.
- **Aktuality.** Původní web měl sekci aktualit, která byla dlouhodobě prázdná —
  proto tu není. Kdyby ji stáj chtěla používat, přidá se jako další kolekce
  v `keystatic.config.ts` se stejným vzorem jako kalendář akcí.
- **Formulář na Vercelu.** Teď míří na externí službu. Až bude jistá cílová
  doména, dá se nahradit vlastní serverovou funkcí a odesílat e-maily přímo.
- **Cizojazyčné verze.** Staré `/en/` a `/de/` na původním webu nefungovaly.
  Astro má i18n připravené, kdyby byl o překlad zájem.
- **E-maily z rezervací.** Systém teď posílá jen potvrzení registrace a obnovu
  hesla, o které se stará Supabase. Upozornění stáji na nového jezdce
  ke schválení, členovi na schválení účtu a připomínku den před termínem by
  bylo potřeba doplnit (Supabase *Database Webhooks* a odesílací služba).
- **Opakované rezervace.** Kdo jezdí každé úterý v šest, musí si teď každý
  týden kliknout znovu. Šlo by přidat „zopakovat na další čtyři týdny".
