-- =====================================================================
--  STÁJ MANON — PŘIHLÁŠKY NA AKCE
--  Schéma databáze pro Supabase (PostgreSQL).
--
--  Samostatný systém. S rezervacemi jízdáren nesdílí tabulky, pravidla
--  ani správce. Může běžet ve stejném projektu Supabase, nebo v úplně
--  jiném (viz PRIHLASKY_SUPABASE_URL v .env.example).
--
--  Jak to nasadit:
--    Supabase → SQL Editor → New query → vložit celý tento soubor → Run.
--    Skript jde spustit opakovaně, nic už uloženého nesmaže. Obsahuje
--    i převod ze staršího schématu, kde byly jen tábory.
--
--  Co systém umí:
--    * jedna akce = jeden termín s vlastním ceníkem a vlastním formulářem
--    * typ akce (tábor, pobyt, jezdecké hry, soustředění, závody) určuje,
--      na co se formulář ptá — viz src/lib/prihlasky/typy.ts
--    * na jednu přihlášku jde přihlásit víc účastníků (klub pošle celou
--      skupinu jezdců najednou), každý s vlastním výběrem z ceníku
--    * u akcí se startovným se platební údaje ukážou hned po odeslání
--
--  Bezpečnostní princip: všechna pravidla hlídá databáze, ne prohlížeč.
--    * přihlášku může poslat kdokoli, ale jen přes funkci odeslat_prihlasku(),
--      která cenu spočítá sama z ceníku akce, klientovi nevěří nic
--    * přihlášky nikdo zvenčí nepřečte, jen správce přihlášek
--    * správce přihlášek je někdo jiný než správce rezervací
-- =====================================================================


-- ---------------------------------------------------------------- převod
--
-- Starší verze měla tabulku `tabory` a v přihlášce napevno jedno dítě.
-- Tenhle blok ji přejmenuje a data o dítěti přesype do seznamu účastníků.
-- Na čisté databázi neudělá nic.

do $prevod$
begin
  if to_regclass('public.tabory') is not null and to_regclass('public.akce') is null then
    alter table public.tabory rename to akce;
  end if;

  if to_regclass('public.prihlasky') is not null then
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'prihlasky' and column_name = 'tabor') then
      alter table public.prihlasky rename column tabor to akce;
    end if;

    for i in 1..1 loop
      -- zástupce → obecný kontakt
      if exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'prihlasky' and column_name = 'zastupce_jmeno') then
        alter table public.prihlasky rename column zastupce_jmeno   to kontakt_jmeno;
        alter table public.prihlasky rename column zastupce_email   to kontakt_email;
        alter table public.prihlasky rename column zastupce_telefon to kontakt_telefon;
        alter table public.prihlasky rename column zastupce_adresa  to kontakt_adresa;
      end if;
    end loop;
  end if;
end
$prevod$;


-- ---------------------------------------------------------------- tabulky

-- Akce = jeden termín, na který se jde přihlásit.
--
-- `varianty` a `priplatky` jsou ceníkové položky ve tvaru
--   [{"kod": "zakladni", "nazev": "Základní cena", "popis": "", "cena": 11400}]
--
-- `vyber` říká, jestli si účastník vybere z variant právě jednu
-- (tábor: jedna cena za pobyt), nebo klidně několik
-- (jezdecké hry: jezdec se hlásí do víc soutěží a startovné se sečte).
create table if not exists public.akce (
  kod           text primary key check (kod ~ '^[a-z0-9-]{3,60}$'),
  typ           text    not null default 'tabor'
                check (typ in ('tabor', 'pobyt', 'hry', 'soustredeni', 'zavody')),
  nazev         text    not null,
  podtitul      text    not null default '',
  popis         text    not null default '',
  zacatek       date    not null,
  konec         date    not null,
  nastup        text    not null default '',
  odjezd        text    not null default '',
  vek_od        integer,
  kapacita      integer not null default 0 check (kapacita >= 0),
  -- Kolik účastníků smí být na jedné přihlášce. 1 = jeden formulář na
  -- jedno dítě, víc = klub přihlásí celou skupinu najednou.
  max_ucastniku integer not null default 1 check (max_ucastniku between 1 and 40),
  vyber         text    not null default 'jedna' check (vyber in ('jedna', 'vice')),
  -- Kolik dní před začátkem musí být zaplaceno.
  splatnost_dni integer not null default 30 check (splatnost_dni >= 0),
  -- true = platební údaje se ukážou hned po odeslání (startovné),
  -- false = pošlou se až s potvrzením místa (tábory a pobyty).
  platba_hned   boolean not null default false,
  varianty      jsonb   not null default '[]' check (jsonb_typeof(varianty) = 'array'),
  priplatky     jsonb   not null default '[]' check (jsonb_typeof(priplatky) = 'array'),
  otevreno      boolean not null default true,
  vytvoreno     timestamptz not null default now(),
  check (konec >= zacatek)
);

-- Doplnění sloupců, když už tabulka existovala ze starší verze.
alter table public.akce add column if not exists typ text not null default 'tabor';
alter table public.akce add column if not exists max_ucastniku integer not null default 1;
alter table public.akce add column if not exists vyber text not null default 'jedna';
alter table public.akce add column if not exists platba_hned boolean not null default false;

do $doplnky$
begin
  if not exists (select 1 from pg_constraint where conname = 'akce_typ_check') then
    alter table public.akce add constraint akce_typ_check
      check (typ in ('tabor', 'pobyt', 'hry', 'soustredeni', 'zavody'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'akce_vyber_check') then
    alter table public.akce add constraint akce_vyber_check check (vyber in ('jedna', 'vice'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'akce_max_ucastniku_check') then
    alter table public.akce add constraint akce_max_ucastniku_check
      check (max_ucastniku between 1 and 40);
  end if;
end
$doplnky$;

-- Variabilní symbol: dvojčíslí roku + pořadové číslo, např. 270001.
create sequence if not exists public.prihlasky_cislo;

-- Přihláška. Ceník se ukládá tak, jak platil v okamžiku odeslání:
-- pozdější změna ceníku už přihlášku nepřepíše.
--
-- `ucastnici` je seznam přihlášených, každý s vlastními položkami:
--   [{"jmeno": "Anna Nováková", "narozeni": "2016-04-03", "kun": "Jiskra",
--     "polozky": [{"kod": "…", "nazev": "…", "cena": 250}], "cena": 250}]
-- Která pole formulář vyplňuje, určuje typ akce (typy.ts).
create table if not exists public.prihlasky (
  id               uuid primary key default gen_random_uuid(),
  -- Náhodný klíč z formuláře. Dvojklik ani obnovení stránky nezaloží
  -- druhou přihlášku.
  token            uuid not null unique,
  vs               text not null unique,
  akce             text not null references public.akce (kod) on delete restrict,
  ucastnici        jsonb   not null default '[]' check (jsonb_typeof(ucastnici) = 'array'),
  cena             integer not null check (cena >= 0),

  -- Klub, stáj nebo firma, za kterou se přihláška podává. U táborů prázdné.
  subjekt          text not null default '',

  kontakt_jmeno    text not null,
  kontakt_email    text not null,
  kontakt_telefon  text not null,
  kontakt_adresa   text not null default '',

  -- osoba = převodem, firma = na fakturu, misto = hotově při akci
  platce           text not null check (platce in ('osoba', 'firma', 'misto')),
  firma_ico        text not null default '',
  firma_nazev      text not null default '',
  firma_adresa     text not null default '',
  firma_dic        text not null default '',
  firma_email      text not null default '',
  firma_objednavka text not null default '',

  poznamka         text    not null default '',
  souhlas_podminky boolean not null check (souhlas_podminky),
  souhlas_foto     boolean not null default false,

  stav             text not null default 'nova'
                   check (stav in ('nova', 'prijata', 'nahradnik', 'odmitnuta', 'zrusena')),
  zaplaceno        date,
  faktura_cislo    text not null default '',
  poznamka_staje   text not null default '',

  vytvoreno        timestamptz not null default now(),
  zmeneno          timestamptz not null default now()
);

alter table public.prihlasky add column if not exists ucastnici jsonb not null default '[]';
alter table public.prihlasky add column if not exists subjekt text not null default '';

-- Platba na místě přibyla později, starší databáze znají jen osobu a firmu.
alter table public.prihlasky drop constraint if exists prihlasky_platce_check;
alter table public.prihlasky add constraint prihlasky_platce_check
  check (platce in ('osoba', 'firma', 'misto'));

-- Převod starého tvaru: jedno dítě → jednoprvkový seznam účastníků.
do $ucastnici$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'prihlasky' and column_name = 'dite_jmeno') then
    update public.prihlasky set ucastnici = jsonb_build_array(
      jsonb_strip_nulls(jsonb_build_object(
        'jmeno',      dite_jmeno,
        'narozeni',   to_char(dite_narozeni, 'YYYY-MM-DD'),
        'zkusenosti', nullif(dite_zkusenosti, ''),
        'zdravi',     nullif(dite_zdravi, ''),
        'pojistovna', nullif(dite_pojistovna, ''),
        'polozky',    coalesce(jsonb_build_array(varianta) || priplatky, '[]'::jsonb),
        'cena',       cena
      ))
    )
    where ucastnici = '[]'::jsonb;

    alter table public.prihlasky
      drop column dite_jmeno,
      drop column dite_narozeni,
      drop column dite_zkusenosti,
      drop column dite_zdravi,
      drop column dite_pojistovna,
      drop column varianta,
      drop column priplatky;
  end if;
end
$ucastnici$;

create index if not exists prihlasky_akce_idx on public.prihlasky (akce, vytvoreno desc);

-- Kdo smí do správy přihlášek. Zapisuje se jen v SQL editoru (viz konec).
create table if not exists public.prihlasky_spravci (
  uzivatel  uuid primary key references auth.users (id) on delete cascade,
  jmeno     text not null default '',
  vytvoreno timestamptz not null default now()
);


-- ---------------------------------------------------------------- ukázkové akce
--
-- Od každého typu jedna, ať je vidět, jak se formuláře liší. Termíny jsou
-- smyšlené (sezóna 2027), aby zůstaly otevřené.
--
-- Další akce se tímhle skriptem zakládat nemusí: ve správě přihlášek je na to
-- formulář (/prihlasky/sprava → Nová akce), včetně ceníku a zavírání přihlášek.
-- V kalendáři na akce odkazují záznamy v src/obsah/akce/ polem „prihlaska“.

insert into public.akce (
  kod, typ, nazev, podtitul, popis, zacatek, konec, nastup, odjezd,
  vek_od, kapacita, max_ucastniku, vyber, splatnost_dni, platba_hned,
  varianty, priplatky
) values

-- 1) Tábor — jedno dítě na přihlášku, jedna cena za pobyt.
(
  'letni-tabor-2027', 'tabor',
  'Letní jezdecký tábor',
  'Týden v sedle pro děti od 8 let',
  'Šest lekcí jízdy, teorie dvakrát denně, plná penze a program od rána do večera. Lekce přizpůsobujeme zkušenostem dětí, začátečníci jezdí na lonži.',
  '2027-07-04', '2027-07-10', 'neděle do 10.00', 'sobota kolem 13.30',
  8, 12, 1, 'jedna', 30, false,
  '[
    {"kod": "zakladni",   "nazev": "Základní cena",   "popis": "Třílůžkový pokoj s vlastním sociálním zařízením.", "cena": 11400},
    {"kod": "zvyhodnena", "nazev": "Zvýhodněná cena", "popis": "Děti do 10 let včetně, úplní začátečníci a členové JKHS.", "cena": 10900}
  ]',
  '[
    {"kod": "vlastni-kun", "nazev": "Ustájení vlastního koně", "popis": "Včetně steliva a sena.", "cena": 1000}
  ]'
),

-- 2) Pobyt s výukou — jako tábor, jen kratší a bez věkového stropu navrch.
(
  'velikonocni-pobyt-2027', 'pobyt',
  'Velikonoční pobyt s výukou',
  'Čtyři dny ježdění o velikonočních prázdninách',
  'Čtyři výukové lekce, teorie k ZZVJ, péče o koně a výlet do okolí. Ubytování a plná penze v penzionu přímo v areálu.',
  '2027-03-25', '2027-03-28', 'čtvrtek do 18.00', 'neděle ve 14.00',
  8, 14, 1, 'jedna', 14, false,
  '[
    {"kod": "zakladni",   "nazev": "Základní cena",   "popis": "Ubytování, plná penze, čtyři lekce.", "cena": 7900},
    {"kod": "bez-noclehu","nazev": "Bez ubytování",   "popis": "Pro děti z okolí, které dojíždějí.",  "cena": 5400}
  ]',
  '[
    {"kod": "vlastni-kun", "nazev": "Ustájení vlastního koně", "cena": 900}
  ]'
),

-- 3) Jezdecké hry — klub přihlásí víc jezdců, každý startuje v několika
--    soutěžích. Startovné se platí rovnou, proto platba_hned = true.
(
  'jezdecke-hry-2027-jaro', 'hry',
  'Jezdecké hry pro děti',
  'Pro děti na ponících i velkých koních',
  'Jízdy zručnosti, jízda zručnosti v kombinaci se skákáním a parkury 40–60 cm. Ceny na 1.–5. místě, floty pro všechny startující. Jízda zručnosti je omezena pěti starty na jednoho koně.',
  '2027-03-28', '2027-03-28', 'prezentace 8.00–9.00', 'začátek soutěží v 10.00',
  null, 0, 20, 'vice', 0, true,
  '[
    {"kod": "zrucnost-a",  "nazev": "1. Jízda zručnosti — skupina A", "popis": "10 úkolů, bez vodiče.",                 "cena": 250},
    {"kod": "zrucnost-b",  "nazev": "1. Jízda zručnosti — skupina B", "popis": "10 úkolů, s vodičem.",                  "cena": 250},
    {"kod": "zrucnost-sk", "nazev": "2. Jízda zručnosti se skákáním", "popis": "7–8 úkolů, 3–4 křížky. S vodičem se nevaluje a k času se přičítá 10 vteřin.", "cena": 250},
    {"kod": "krizky",      "nazev": "3. Křížkový parkur",             "popis": "8 malých křížků s rozeskakováním.",     "cena": 300},
    {"kod": "parkur-50",   "nazev": "4. Parkur 40/50 cm",             "popis": "8 překážek, bez kombinace.",            "cena": 300},
    {"kod": "parkur-60",   "nazev": "5. Parkur 50/60 cm",             "popis": "8 překážek, bez kombinace.",            "cena": 300}
  ]',
  '[
    {"kod": "box", "nazev": "Box pro koně na den", "popis": "Včetně steliva.", "cena": 400}
  ]'
),

-- 4) Soustředění — jezdec s vlastním koněm, jeden nebo dva dny.
(
  'skokove-soustredeni-2027', 'soustredeni',
  'Skokové soustředění s Jiřím Skřivanem',
  'Dva dny práce na skokovém sedu a technice',
  'Trénink ve skupinách po čtyřech podle výkonnosti, čtyři jednotky celkem, rozbor s videem. S vlastním koněm.',
  '2027-04-17', '2027-04-18', 'sobota od 9.00', 'neděle kolem 16.00',
  null, 16, 4, 'jedna', 7, true,
  '[
    {"kod": "oba-dny", "nazev": "Oba dny",    "popis": "Čtyři tréninkové jednotky.", "cena": 3200},
    {"kod": "jeden-den","nazev": "Jeden den", "popis": "Dvě tréninkové jednotky.",   "cena": 1800}
  ]',
  '[
    {"kod": "box",     "nazev": "Box na noc",        "popis": "Včetně steliva a sena.", "cena": 500},
    {"kod": "nocleh",  "nazev": "Nocleh v penzionu", "popis": "Za osobu a noc.",        "cena": 840}
  ]'
),

-- 5) Veřejný trénink — jezdec s licencí, startuje v několika parkurech.
(
  'verejny-trenink-2027-leden', 'zavody',
  'Veřejný trénink',
  'Halové parkury Z až L',
  'Otevřeno pro jezdce s licencí i hobby dvojice. Startuje se v pořadí podle prezentace, opakované starty na jednom koni jsou možné.',
  '2027-01-16', '2027-01-16', 'prezentace 8.30–9.30', 'první parkur v 10.00',
  null, 0, 6, 'vice', 0, true,
  '[
    {"kod": "z",  "nazev": "Parkur Z (100 cm)",  "cena": 300},
    {"kod": "zl", "nazev": "Parkur ZL (110 cm)", "cena": 300},
    {"kod": "l",  "nazev": "Parkur L (120 cm)",  "cena": 350},
    {"kod": "hobby", "nazev": "Hobby parkur do 90 cm", "cena": 250}
  ]',
  '[
    {"kod": "box", "nazev": "Box pro koně na den", "cena": 400}
  ]'
)

on conflict (kod) do nothing;


-- ---------------------------------------------------------------- pomocné funkce

create or replace function public.je_spravce_prihlasek()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.prihlasky_spravci where uzivatel = auth.uid()
  );
$fn$;

create or replace function public.prihlasky_zmeneno()
returns trigger
language plpgsql
as $fn$
begin
  new.zmeneno := now();
  return new;
end;
$fn$;

drop trigger if exists prihlasky_zmeneno on public.prihlasky;
create trigger prihlasky_zmeneno
  before update on public.prihlasky
  for each row execute function public.prihlasky_zmeneno();


-- ---------------------------------------------------------------- odeslání přihlášky
--
-- Jediná cesta, jak přihláška vznikne. Web ji volá s údaji z formuláře,
-- ale všechno podstatné si funkce ověří znovu: kdo mluví s databází
-- napřímo, obejde formulář, ne tahle pravidla.
--
-- Vrací {"id", "vs", "cena", "nova"}. `nova = false` znamená, že stejný
-- formulář už jednou prošel a vrací se původní přihláška.

create or replace function public.odeslat_prihlasku(p jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $fn$
declare
  v_token       uuid;
  v_puvodni     public.prihlasky;
  v_akce        public.akce;
  v_ucastnici   jsonb := '[]';
  v_ucastnik    jsonb;
  v_polozky     jsonb;
  v_polozka     jsonb;
  v_kod         text;
  v_cena_u      integer;
  v_cena        integer := 0;
  v_pocet       integer := 0;
  v_variant     integer;
  v_jmeno       text;
  v_narozeni    date;
  v_platce      text;
  v_email_re    constant text := '^[^@\s]+@[^@\s]+\.[^@\s]+$';
  v_nova        public.prihlasky;
begin
  begin
    v_token := (p ->> 'token')::uuid;
  exception when others then
    v_token := null;
  end;

  if v_token is null then
    raise exception 'Formulář vypršel. Načtěte prosím stránku znovu.'
      using errcode = 'check_violation';
  end if;

  select * into v_puvodni from public.prihlasky where token = v_token;
  if found then
    return jsonb_build_object(
      'id', v_puvodni.id, 'vs', v_puvodni.vs, 'cena', v_puvodni.cena, 'nova', false
    );
  end if;

  -- Pojistka proti robotům, kteří by chtěli databázi zasypat.
  if (
    select count(*) from public.prihlasky
    where vytvoreno > now() - interval '10 minutes'
  ) >= 40 then
    raise exception 'Právě teď přichází příliš mnoho přihlášek. Zkuste to prosím za chvíli.'
      using errcode = 'check_violation';
  end if;

  select * into v_akce from public.akce where kod = p ->> 'akce';

  if not found
     or not v_akce.otevreno
     or v_akce.zacatek < (timezone('Europe/Prague', now()))::date then
    raise exception 'Na tuhle akci se už přihlásit nejde.'
      using errcode = 'check_violation';
  end if;

  if jsonb_typeof(p -> 'ucastnici') <> 'array'
     or jsonb_array_length(p -> 'ucastnici') = 0 then
    raise exception 'Přihláška musí mít aspoň jednoho účastníka.'
      using errcode = 'check_violation';
  end if;

  if jsonb_array_length(p -> 'ucastnici') > v_akce.max_ucastniku then
    raise exception 'Na jednu přihlášku jde přidat nejvýš % účastníků.', v_akce.max_ucastniku
      using errcode = 'check_violation';
  end if;

  -- Každý účastník zvlášť: jméno, datum narození a položky z ceníku akce.
  for v_ucastnik in select value from jsonb_array_elements(p -> 'ucastnici')
  loop
    v_pocet := v_pocet + 1;
    v_polozky := '[]';
    v_cena_u := 0;
    v_variant := 0;

    v_jmeno := trim(coalesce(v_ucastnik ->> 'jmeno', ''));
    if length(v_jmeno) < 3 then
      raise exception 'U % účastníka chybí jméno a příjmení.', v_pocet
        using errcode = 'check_violation';
    end if;

    v_narozeni := null;
    if coalesce(v_ucastnik ->> 'narozeni', '') <> '' then
      begin
        v_narozeni := (v_ucastnik ->> 'narozeni')::date;
      exception when others then
        raise exception 'U účastníka % není platné datum narození.', v_jmeno
          using errcode = 'check_violation';
      end;

      if v_narozeni >= v_akce.zacatek
         or v_narozeni < v_akce.zacatek - interval '100 years' then
        raise exception 'U účastníka % není platné datum narození.', v_jmeno
          using errcode = 'check_violation';
      end if;

      if v_akce.vek_od is not null
         and extract(year from age(v_akce.zacatek, v_narozeni)) < v_akce.vek_od then
        raise exception 'Akce je pro děti od % let, účastník % je mladší.', v_akce.vek_od, v_jmeno
          using errcode = 'check_violation';
      end if;
    elsif v_akce.typ in ('tabor', 'pobyt') then
      raise exception 'U účastníka % chybí datum narození.', v_jmeno
        using errcode = 'check_violation';
    end if;

    -- Varianty: u „jedna“ právě jedna, u „vice“ aspoň jedna.
    for v_kod in
      select distinct x from jsonb_array_elements_text(
        case when jsonb_typeof(v_ucastnik -> 'varianty') = 'array'
             then v_ucastnik -> 'varianty' else '[]'::jsonb end) x
    loop
      select v into v_polozka from jsonb_array_elements(v_akce.varianty) v
      where v ->> 'kod' = v_kod;

      if v_polozka is null then
        raise exception 'Tahle položka u akce není.' using errcode = 'check_violation';
      end if;

      v_variant := v_variant + 1;
      v_polozky := v_polozky || jsonb_build_array(jsonb_build_object(
        'kod', v_polozka ->> 'kod', 'nazev', v_polozka ->> 'nazev',
        'cena', (v_polozka ->> 'cena')::integer));
      v_cena_u := v_cena_u + (v_polozka ->> 'cena')::integer;
    end loop;

    if v_variant = 0 then
      raise exception 'U účastníka % chybí výběr z ceníku.', v_jmeno
        using errcode = 'check_violation';
    end if;

    if v_akce.vyber = 'jedna' and v_variant > 1 then
      raise exception 'U účastníka % smí být vybraná jen jedna položka ceníku.', v_jmeno
        using errcode = 'check_violation';
    end if;

    -- Příplatky.
    for v_kod in
      select distinct x from jsonb_array_elements_text(
        case when jsonb_typeof(v_ucastnik -> 'priplatky') = 'array'
             then v_ucastnik -> 'priplatky' else '[]'::jsonb end) x
    loop
      select v into v_polozka from jsonb_array_elements(v_akce.priplatky) v
      where v ->> 'kod' = v_kod;

      if v_polozka is null then
        raise exception 'Tenhle příplatek u akce není.' using errcode = 'check_violation';
      end if;

      v_polozky := v_polozky || jsonb_build_array(jsonb_build_object(
        'kod', v_polozka ->> 'kod', 'nazev', v_polozka ->> 'nazev',
        'cena', (v_polozka ->> 'cena')::integer));
      v_cena_u := v_cena_u + (v_polozka ->> 'cena')::integer;
    end loop;

    v_cena := v_cena + v_cena_u;

    v_ucastnici := v_ucastnici || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'jmeno',      left(v_jmeno, 80),
      'narozeni',   case when v_narozeni is null then null else to_char(v_narozeni, 'YYYY-MM-DD') end,
      'kun',        nullif(left(trim(coalesce(v_ucastnik ->> 'kun', '')), 80), ''),
      'zkusenosti', nullif(left(trim(coalesce(v_ucastnik ->> 'zkusenosti', '')), 120), ''),
      'uroven',     nullif(left(trim(coalesce(v_ucastnik ->> 'uroven', '')), 120), ''),
      'licence',    nullif(left(trim(coalesce(v_ucastnik ->> 'licence', '')), 40), ''),
      'zdravi',     nullif(left(trim(coalesce(v_ucastnik ->> 'zdravi', '')), 1000), ''),
      'pojistovna', nullif(left(trim(coalesce(v_ucastnik ->> 'pojistovna', '')), 60), ''),
      'polozky',    v_polozky,
      'cena',       v_cena_u
    )));
  end loop;

  -- Kontaktní osoba.
  if length(trim(coalesce(p ->> 'kontakt_jmeno', ''))) < 3 then
    raise exception 'Vyplňte prosím jméno kontaktní osoby.'
      using errcode = 'check_violation';
  end if;

  if trim(coalesce(p ->> 'kontakt_email', '')) !~ v_email_re then
    raise exception 'Zadejte prosím platný e-mail kontaktní osoby.'
      using errcode = 'check_violation';
  end if;

  if length(regexp_replace(coalesce(p ->> 'kontakt_telefon', ''), '\D', '', 'g')) < 9 then
    raise exception 'Zadejte prosím telefon kontaktní osoby.'
      using errcode = 'check_violation';
  end if;

  v_platce := p ->> 'platce';
  if v_platce is null or v_platce not in ('osoba', 'firma', 'misto') then
    raise exception 'Vyberte prosím, jak akci zaplatíte.'
      using errcode = 'check_violation';
  end if;

  -- U jezdeckých her se startovní listina řadí podle klubů, bez klubu
  -- nebo stáje se jezdec nemá kam zařadit. Platí i pro jednotlivce.
  if v_akce.typ = 'hry' and length(trim(coalesce(p ->> 'subjekt', ''))) < 2 then
    raise exception 'Vyplňte prosím klub nebo stáj.'
      using errcode = 'check_violation';
  end if;

  if v_platce = 'firma' then
    if coalesce(p ->> 'firma_ico', '') !~ '^\d{8}$' then
      raise exception 'Zadejte prosím platné IČO firmy.'
        using errcode = 'check_violation';
    end if;
    if length(trim(coalesce(p ->> 'firma_nazev', ''))) < 2
       or length(trim(coalesce(p ->> 'firma_adresa', ''))) < 5 then
      raise exception 'Vyplňte prosím název a adresu firmy.'
        using errcode = 'check_violation';
    end if;
    if trim(coalesce(p ->> 'firma_email', '')) !~ v_email_re then
      raise exception 'Zadejte prosím e-mail, kam poslat fakturu.'
        using errcode = 'check_violation';
    end if;
  end if;

  if coalesce((p ->> 'souhlas_podminky')::boolean, false) is not true then
    raise exception 'Bez souhlasu s podmínkami přihlášku odeslat nejde.'
      using errcode = 'check_violation';
  end if;

  insert into public.prihlasky (
    token, vs, akce, ucastnici, cena, subjekt,
    kontakt_jmeno, kontakt_email, kontakt_telefon, kontakt_adresa,
    platce, firma_ico, firma_nazev, firma_adresa, firma_dic, firma_email, firma_objednavka,
    poznamka, souhlas_podminky, souhlas_foto
  ) values (
    v_token,
    to_char(timezone('Europe/Prague', now()), 'YY')
      || lpad(nextval('public.prihlasky_cislo')::text, 4, '0'),
    v_akce.kod,
    v_ucastnici,
    v_cena,
    left(trim(coalesce(p ->> 'subjekt', '')), 120),
    left(trim(p ->> 'kontakt_jmeno'), 80),
    lower(left(trim(p ->> 'kontakt_email'), 120)),
    left(trim(p ->> 'kontakt_telefon'), 30),
    left(trim(coalesce(p ->> 'kontakt_adresa', '')), 200),
    v_platce,
    case when v_platce = 'firma' then p ->> 'firma_ico' else '' end,
    case when v_platce = 'firma' then left(trim(p ->> 'firma_nazev'), 160) else '' end,
    case when v_platce = 'firma' then left(trim(p ->> 'firma_adresa'), 200) else '' end,
    case when v_platce = 'firma' then left(trim(coalesce(p ->> 'firma_dic', '')), 14) else '' end,
    case when v_platce = 'firma' then lower(left(trim(p ->> 'firma_email'), 120)) else '' end,
    case when v_platce = 'firma' then left(trim(coalesce(p ->> 'firma_objednavka', '')), 60) else '' end,
    left(trim(coalesce(p ->> 'poznamka', '')), 1000),
    true,
    coalesce((p ->> 'souhlas_foto')::boolean, false)
  )
  on conflict (token) do nothing
  returning * into v_nova;

  -- Dva stejné požadavky ve stejné chvíli: druhý narazí na token prvního.
  if v_nova.id is null then
    select * into v_nova from public.prihlasky where token = v_token;
    return jsonb_build_object(
      'id', v_nova.id, 'vs', v_nova.vs, 'cena', v_nova.cena, 'nova', false
    );
  end if;

  return jsonb_build_object(
    'id', v_nova.id, 'vs', v_nova.vs, 'cena', v_nova.cena, 'nova', true
  );
end;
$fn$;


-- ---------------------------------------------------------------- RLS
--
-- Co není výslovně povolené, je zakázané.

alter table public.akce               enable row level security;
alter table public.prihlasky          enable row level security;
alter table public.prihlasky_spravci  enable row level security;

-- Akce si přečte kdokoli (veřejná stránka s přihláškou), mění správce.
drop policy if exists tabory_cteni on public.akce;
drop policy if exists tabory_sprava on public.akce;
drop policy if exists akce_cteni on public.akce;
create policy akce_cteni on public.akce
  for select using (true);

drop policy if exists akce_sprava on public.akce;
create policy akce_sprava on public.akce
  for all using (public.je_spravce_prihlasek())
  with check (public.je_spravce_prihlasek());

-- Přihlášky vidí a mění jen správce. Zakládají se jen přes funkci výše,
-- proto tu pravidlo pro insert schválně chybí.
drop policy if exists prihlasky_cteni on public.prihlasky;
create policy prihlasky_cteni on public.prihlasky
  for select using (public.je_spravce_prihlasek());

drop policy if exists prihlasky_uprava on public.prihlasky;
create policy prihlasky_uprava on public.prihlasky
  for update using (public.je_spravce_prihlasek())
  with check (public.je_spravce_prihlasek());

drop policy if exists prihlasky_smazani on public.prihlasky;
create policy prihlasky_smazani on public.prihlasky
  for delete using (public.je_spravce_prihlasek());

-- Seznam správců: každý vidí jen sám sebe.
drop policy if exists prihlasky_spravci_cteni on public.prihlasky_spravci;
create policy prihlasky_spravci_cteni on public.prihlasky_spravci
  for select using (uzivatel = auth.uid());


-- ---------------------------------------------------------------- práva

grant usage on schema public to anon, authenticated;

grant select on public.akce to anon, authenticated;
grant insert, update, delete on public.akce to authenticated;
grant select, update, delete on public.prihlasky to authenticated;
grant select on public.prihlasky_spravci to authenticated;

-- Přímý zápis do přihlášek a čtení čísel přihlášek zvenčí nepotřebuje nikdo.
revoke insert on public.prihlasky from anon, authenticated;
revoke all on sequence public.prihlasky_cislo from anon, authenticated;

revoke all on function public.odeslat_prihlasku(jsonb) from public;
grant execute on function public.odeslat_prihlasku(jsonb) to anon, authenticated;
grant execute on function public.je_spravce_prihlasek() to anon, authenticated;


-- =====================================================================
--  POSLEDNÍ KROK: správce přihlášek
--
--  1. Supabase → Authentication → Users → Add user → Create new user.
--     Vyplňte e-mail a heslo a zaškrtněte Auto Confirm User.
--
--  2. Doplňte ten e-mail sem a spusťte:
--
--       insert into public.prihlasky_spravci (uzivatel, jmeno)
--       select id, 'Miroslava Skřivanová' from auth.users
--       where email = 'vas@email.cz'
--       on conflict (uzivatel) do nothing;
--
--  Pak se přihlásíte na /prihlasky/prihlaseni.
-- =====================================================================
