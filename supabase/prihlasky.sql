-- =====================================================================
--  STÁJ MANON — PŘIHLÁŠKY NA TÁBORY
--  Schéma databáze pro Supabase (PostgreSQL).
--
--  Samostatný systém. S rezervacemi jízdáren nesdílí tabulky, pravidla
--  ani správce. Může běžet ve stejném projektu Supabase, nebo v úplně
--  jiném (viz PRIHLASKY_SUPABASE_URL v .env.example).
--
--  Jak to nasadit:
--    Supabase → SQL Editor → New query → vložit celý tento soubor → Run.
--    Skript jde spustit opakovaně, nic už uloženého nesmaže.
--
--  Bezpečnostní princip: všechna pravidla hlídá databáze, ne prohlížeč.
--    * přihlášku může poslat kdokoli, ale jen přes funkci odeslat_prihlasku(),
--      která cenu spočítá sama z ceníku tábora, klientovi nevěří nic
--    * přihlášky nikdo zvenčí nepřečte, jen správce přihlášek
--    * správce přihlášek je někdo jiný než správce rezervací
-- =====================================================================


-- ---------------------------------------------------------------- tabulky

-- Tábor = jeden termín, na který se jde přihlásit.
-- Varianty ceny a příplatky jsou seznamy ve tvaru
--   [{"kod": "zakladni", "nazev": "Základní cena", "popis": "", "cena": 11400}]
-- Právě jedna varianta je povinná, příplatky jsou volitelné.
create table if not exists public.tabory (
  kod           text primary key check (kod ~ '^[a-z0-9-]{3,60}$'),
  nazev         text    not null,
  podtitul      text    not null default '',
  popis         text    not null default '',
  zacatek       date    not null,
  konec         date    not null,
  nastup        text    not null default '',
  odjezd        text    not null default '',
  vek_od        integer,
  kapacita      integer not null default 0 check (kapacita >= 0),
  -- Kolik dní před nástupem musí být zaplaceno.
  splatnost_dni integer not null default 30 check (splatnost_dni >= 0),
  varianty      jsonb   not null default '[]' check (jsonb_typeof(varianty) = 'array'),
  priplatky     jsonb   not null default '[]' check (jsonb_typeof(priplatky) = 'array'),
  otevreno      boolean not null default true,
  vytvoreno     timestamptz not null default now(),
  check (konec >= zacatek)
);

-- Variabilní symbol: dvojčíslí roku + pořadové číslo, např. 270001.
create sequence if not exists public.prihlasky_cislo;

-- Přihláška. Varianta, příplatky a cena se ukládají tak, jak platily
-- v okamžiku odeslání: pozdější změna ceníku už přihlášku nepřepíše.
create table if not exists public.prihlasky (
  id               uuid primary key default gen_random_uuid(),
  -- Náhodný klíč z formuláře. Dvojklik ani obnovení stránky nezaloží
  -- druhou přihlášku.
  token            uuid not null unique,
  vs               text not null unique,
  tabor            text not null references public.tabory (kod) on delete restrict,
  varianta         jsonb   not null,
  priplatky        jsonb   not null default '[]',
  cena             integer not null check (cena >= 0),

  dite_jmeno       text not null,
  dite_narozeni    date not null,
  dite_zkusenosti  text not null default '',
  dite_zdravi      text not null default '',
  dite_pojistovna  text not null default '',

  zastupce_jmeno   text not null,
  zastupce_email   text not null,
  zastupce_telefon text not null,
  zastupce_adresa  text not null default '',

  platce           text not null check (platce in ('osoba', 'firma')),
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

create index if not exists prihlasky_tabor_idx on public.prihlasky (tabor, vytvoreno desc);

-- Kdo smí do správy přihlášek. Zapisuje se jen v SQL editoru (viz konec).
create table if not exists public.prihlasky_spravci (
  uzivatel  uuid primary key references auth.users (id) on delete cascade,
  jmeno     text not null default '',
  vytvoreno timestamptz not null default now()
);


-- ---------------------------------------------------------------- první tábor
--
-- Smyšlený termín na vyzkoušení. V kalendáři akcí na něj odkazuje akce
-- „Letní jezdecký tábor“ (src/obsah/akce/, pole prihlaska). Přihláška se
-- zavře přes `update public.tabory set otevreno = false
-- where kod = 'letni-tabor-2027';`

insert into public.tabory (
  kod, nazev, podtitul, popis, zacatek, konec, nastup, odjezd,
  vek_od, kapacita, splatnost_dni, varianty, priplatky
) values (
  'letni-tabor-2027',
  'Letní jezdecký tábor',
  'Týden v sedle pro děti od 8 let',
  'Šest lekcí jízdy, teorie dvakrát denně, plná penze a program od rána do večera. Lekce přizpůsobujeme zkušenostem dětí, začátečníci jezdí na lonži.',
  '2027-07-04',
  '2027-07-10',
  'neděle do 10.00',
  'sobota kolem 13.30',
  8,
  12,
  30,
  '[
    {"kod": "zakladni",   "nazev": "Základní cena",   "popis": "Třílůžkový pokoj s vlastním sociálním zařízením.", "cena": 11400},
    {"kod": "zvyhodnena", "nazev": "Zvýhodněná cena", "popis": "Pokoj s palandami, děti do 10 let včetně, úplní začátečníci a členové JKHS.", "cena": 10900}
  ]',
  '[
    {"kod": "vlastni-kun", "nazev": "Ustájení vlastního koně", "popis": "Včetně steliva a sena.", "cena": 1000}
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
  v_token     uuid;
  v_puvodni   public.prihlasky;
  v_tabor     public.tabory;
  v_varianta  jsonb;
  v_priplatky jsonb := '[]';
  v_kod       text;
  v_polozka   jsonb;
  v_cena      integer;
  v_narozeni  date;
  v_platce    text;
  v_email_re  constant text := '^[^@\s]+@[^@\s]+\.[^@\s]+$';
  v_nova      public.prihlasky;
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

  select * into v_tabor from public.tabory where kod = p ->> 'tabor';

  if not found
     or not v_tabor.otevreno
     or v_tabor.zacatek <= (timezone('Europe/Prague', now()))::date then
    raise exception 'Na tenhle tábor se už přihlásit nejde.'
      using errcode = 'check_violation';
  end if;

  -- Varianta a příplatky jen z ceníku tábora. Cenu si počítáme sami.
  select v into v_varianta
  from jsonb_array_elements(v_tabor.varianty) v
  where v ->> 'kod' = p ->> 'varianta';

  if v_varianta is null then
    raise exception 'Vyberte prosím variantu ceny.'
      using errcode = 'check_violation';
  end if;

  v_cena := (v_varianta ->> 'cena')::integer;

  if jsonb_typeof(p -> 'priplatky') = 'array' then
    for v_kod in
      select distinct x from jsonb_array_elements_text(p -> 'priplatky') x
    loop
      select v into v_polozka
      from jsonb_array_elements(v_tabor.priplatky) v
      where v ->> 'kod' = v_kod;

      if v_polozka is null then
        raise exception 'Tenhle příplatek u tábora není.'
          using errcode = 'check_violation';
      end if;

      v_priplatky := v_priplatky || jsonb_build_array(
        jsonb_build_object(
          'kod', v_polozka ->> 'kod',
          'nazev', v_polozka ->> 'nazev',
          'cena', (v_polozka ->> 'cena')::integer
        )
      );
      v_cena := v_cena + (v_polozka ->> 'cena')::integer;
    end loop;
  end if;

  -- Povinné údaje.
  if length(trim(coalesce(p ->> 'dite_jmeno', ''))) < 3 then
    raise exception 'Vyplňte prosím jméno a příjmení dítěte.'
      using errcode = 'check_violation';
  end if;

  begin
    v_narozeni := (p ->> 'dite_narozeni')::date;
  exception when others then
    v_narozeni := null;
  end;

  if v_narozeni is null
     or v_narozeni >= v_tabor.zacatek
     or v_narozeni < v_tabor.zacatek - interval '30 years' then
    raise exception 'Zadejte prosím platné datum narození dítěte.'
      using errcode = 'check_violation';
  end if;

  if length(trim(coalesce(p ->> 'zastupce_jmeno', ''))) < 3 then
    raise exception 'Vyplňte prosím jméno zákonného zástupce.'
      using errcode = 'check_violation';
  end if;

  if trim(coalesce(p ->> 'zastupce_email', '')) !~ v_email_re then
    raise exception 'Zadejte prosím platný e-mail zákonného zástupce.'
      using errcode = 'check_violation';
  end if;

  if length(regexp_replace(coalesce(p ->> 'zastupce_telefon', ''), '\D', '', 'g')) < 9 then
    raise exception 'Zadejte prosím telefon zákonného zástupce.'
      using errcode = 'check_violation';
  end if;

  v_platce := p ->> 'platce';
  if v_platce is null or v_platce not in ('osoba', 'firma') then
    raise exception 'Vyberte prosím, kdo tábor platí.'
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
    token, vs, tabor, varianta, priplatky, cena,
    dite_jmeno, dite_narozeni, dite_zkusenosti, dite_zdravi, dite_pojistovna,
    zastupce_jmeno, zastupce_email, zastupce_telefon, zastupce_adresa,
    platce, firma_ico, firma_nazev, firma_adresa, firma_dic, firma_email, firma_objednavka,
    poznamka, souhlas_podminky, souhlas_foto
  ) values (
    v_token,
    to_char(timezone('Europe/Prague', now()), 'YY')
      || lpad(nextval('public.prihlasky_cislo')::text, 4, '0'),
    v_tabor.kod,
    jsonb_build_object(
      'kod', v_varianta ->> 'kod',
      'nazev', v_varianta ->> 'nazev',
      'cena', (v_varianta ->> 'cena')::integer
    ),
    v_priplatky,
    v_cena,
    left(trim(p ->> 'dite_jmeno'), 80),
    v_narozeni,
    left(trim(coalesce(p ->> 'dite_zkusenosti', '')), 120),
    left(trim(coalesce(p ->> 'dite_zdravi', '')), 1000),
    left(trim(coalesce(p ->> 'dite_pojistovna', '')), 60),
    left(trim(p ->> 'zastupce_jmeno'), 80),
    lower(left(trim(p ->> 'zastupce_email'), 120)),
    left(trim(p ->> 'zastupce_telefon'), 30),
    left(trim(coalesce(p ->> 'zastupce_adresa', '')), 200),
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

alter table public.tabory            enable row level security;
alter table public.prihlasky         enable row level security;
alter table public.prihlasky_spravci enable row level security;

-- Tábory si přečte kdokoli (veřejná stránka s přihláškou), mění správce.
drop policy if exists tabory_cteni on public.tabory;
create policy tabory_cteni on public.tabory
  for select using (true);

drop policy if exists tabory_sprava on public.tabory;
create policy tabory_sprava on public.tabory
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

grant select on public.tabory to anon, authenticated;
grant insert, update, delete on public.tabory to authenticated;
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
