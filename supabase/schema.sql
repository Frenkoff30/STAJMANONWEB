-- =====================================================================
--  STÁJ MANON — REZERVACE JÍZDÁREN
--  Schéma databáze pro Supabase (PostgreSQL).
--
--  Jak to nasadit:
--    Supabase → SQL Editor → New query → vložit celý tento soubor → Run.
--    Skript jde spustit opakovaně, nic už uloženého nesmaže.
--
--  Bezpečnostní princip: všechna pravidla hlídá databáze, ne prohlížeč.
--  I kdyby někdo obešel web a mluvil s databází přímo, dál platí:
--    * rezervovat může jen přihlášený a stájí schválený člen
--    * rezervovat jde jen sám za sebe, ne za někoho jiného
--    * nejde přebookovat kapacitu, rezervovat do minulosti ani přes blokaci
--    * jména jezdců nepřihlášený neuvidí
-- =====================================================================


-- ---------------------------------------------------------------- tabulky

-- Jízdárny. Kapacita = kolik jezdců se do ní vejde v jednom čase.
create table if not exists public.jizdarny (
  kod       text primary key,
  nazev     text    not null,
  popis     text    not null default '',
  kapacita  integer not null check (kapacita > 0),
  poradi    integer not null default 0,
  aktivni   boolean not null default true
);

-- Časové sloty dne. Odpovídají rozpisu, na který je stáj zvyklá.
create table if not exists public.sloty (
  kod      text primary key,
  zacatek  time not null,
  konec    time not null,
  poradi   integer not null default 0,
  aktivni  boolean not null default true,
  check (konec > zacatek)
);

-- Profil jezdce, 1:1 na přihlašovací účet (auth.users).
-- `schvaleno` je klíčové: bez něj se dá přihlásit, ale ne rezervovat.
create table if not exists public.profily (
  id        uuid primary key references auth.users (id) on delete cascade,
  jmeno     text not null default '',
  telefon   text not null default '',
  role      text not null default 'clen' check (role in ('clen', 'spravce')),
  schvaleno boolean not null default false,
  poznamka  text not null default '',
  vytvoreno timestamptz not null default now()
);

-- Rezervace. Jeden řádek = jedno místo v jízdárně v jednom slotu.
create table if not exists public.rezervace (
  id        uuid primary key default gen_random_uuid(),
  jizdarna  text not null references public.jizdarny (kod) on delete cascade,
  slot      text not null references public.sloty (kod)    on delete cascade,
  datum     date not null,
  uzivatel  uuid not null references auth.users (id) on delete cascade,
  poznamka  text not null default '',
  vytvoreno timestamptz not null default now(),
  -- Jeden člověk nezabere v jednom slotu dvě místa.
  unique (jizdarna, datum, slot, uzivatel)
);

create index if not exists rezervace_datum_idx on public.rezervace (datum);
create index if not exists rezervace_uzivatel_idx on public.rezervace (uzivatel, datum);

-- Blokace = termín zavřený stájí (závody, trénink, údržba, kurz).
-- Prázdná jízdárna znamená všechny, prázdný slot znamená celý den.
create table if not exists public.blokace (
  id        uuid primary key default gen_random_uuid(),
  jizdarna  text references public.jizdarny (kod) on delete cascade,
  slot      text references public.sloty (kod)    on delete cascade,
  datum     date not null,
  duvod     text not null default '',
  vytvoreno timestamptz not null default now()
);

create index if not exists blokace_datum_idx on public.blokace (datum);

-- Hlášky nad kalendářem.
create table if not exists public.oznameni (
  id        uuid primary key default gen_random_uuid(),
  text      text not null,
  typ       text not null default 'info' check (typ in ('info', 'dulezite')),
  aktivni   boolean not null default true,
  poradi    integer not null default 0,
  vytvoreno timestamptz not null default now()
);

-- Pravidla rezervací. Mění se v administraci, ne v kódu.
create table if not exists public.nastaveni (
  klic    text primary key,
  hodnota integer not null,
  popis   text not null default ''
);


-- ---------------------------------------------------------------- výchozí data

insert into public.jizdarny (kod, nazev, popis, kapacita, poradi) values
  ('hala',     'Krytá hala',             'Celoroční ježdění pod střechou.',   5, 1),
  ('venkovni', 'Venkovní jízdárna',      'Skokové tréninky, velké kolbiště.', 2, 2),
  ('mala',     'Venkovní malá jízdárna', 'Tréninky na malé jízdárně.',        2, 3)
on conflict (kod) do nothing;

insert into public.sloty (kod, zacatek, konec, poradi) values
  ('0600-0700', '06:00', '07:00',  1),
  ('0700-0800', '07:00', '08:00',  2),
  ('0800-0900', '08:00', '09:00',  3),
  ('0900-1000', '09:00', '10:00',  4),
  ('1000-1100', '10:00', '11:00',  5),
  ('1100-1200', '11:00', '12:00',  6),
  ('1200-1300', '12:00', '13:00',  7),
  ('1300-1400', '13:00', '14:00',  8),
  ('1400-1500', '14:00', '15:00',  9),
  ('1500-1600', '15:00', '16:00', 10),
  ('1600-1700', '16:00', '17:00', 11),
  ('1700-1800', '17:00', '18:00', 12),
  ('1800-1900', '18:00', '19:00', 13),
  ('1900-2000', '19:00', '20:00', 14),
  ('2000-2100', '20:00', '21:00', 15)
on conflict (kod) do nothing;

insert into public.nastaveni (klic, hodnota, popis) values
  ('horizont_dnu',  21, 'Na kolik dní dopředu jde rezervovat.'),
  ('max_aktivnich', 15, 'Kolik budoucích rezervací smí mít jeden člen zároveň.'),
  ('storno_minut',   0, 'Kolik minut před začátkem jde rezervaci ještě zrušit. 0 = do začátku.')
on conflict (klic) do nothing;


-- ---------------------------------------------------------------- pomocné funkce
--
-- `security definer` = funkce běží s právy vlastníka, takže smí nahlédnout
-- do tabulky profily i tehdy, když ji volá pravidlo RLS nad toutéž tabulkou.
-- Bez toho by se pravidla zacyklila.

create or replace function public.je_clen()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.profily
    where id = auth.uid() and schvaleno
  );
$fn$;

create or replace function public.je_spravce()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.profily
    where id = auth.uid() and role = 'spravce' and schvaleno
  );
$fn$;

-- Dnešek podle českého času, ne podle času serveru.
create or replace function public.dnes_cz()
returns date
language sql
stable
as $fn$
  select (timezone('Europe/Prague', now()))::date;
$fn$;

create or replace function public.ted_cz()
returns timestamp
language sql
stable
as $fn$
  select timezone('Europe/Prague', now());
$fn$;


-- ---------------------------------------------------------------- nový účet
--
-- Po registraci se automaticky založí profil, ale neschválený:
-- rezervovat půjde teprve až ho stáj v administraci pustí dál.

create or replace function public.zaloz_profil()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profily (id, jmeno, telefon)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'jmeno'), ''), ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'telefon'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists zaloz_profil on auth.users;
create trigger zaloz_profil
  after insert on auth.users
  for each row execute function public.zaloz_profil();

-- Člen si smí přepsat jméno a telefon, ale ne vlastní roli a schválení.
-- Kdyby to zkusil, hodnoty se tiše vrátí na původní.
--
-- Výjimka je práce přímo u databáze (SQL editor v Supabase). Web se hlásí
-- vždy jako `anon` nebo `authenticated`, takže tudy se nikdo zvenčí
-- neprotlačí. Zároveň je to jediná cesta, jak jmenovat úplně prvního
-- správce: dokud žádný neexistuje, nemá ho kdo schválit.
create or replace function public.profil_chran_prava()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if public.je_spravce() or current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  new.role      := old.role;
  new.schvaleno := old.schvaleno;
  new.poznamka  := old.poznamka;
  return new;
end;
$fn$;

drop trigger if exists profil_chran_prava on public.profily;
create trigger profil_chran_prava
  before update on public.profily
  for each row execute function public.profil_chran_prava();


-- ---------------------------------------------------------------- kontrola rezervace
--
-- Tady se hlídá všechno, co by šlo obejít posláním vlastního požadavku
-- mimo web.

create or replace function public.rezervace_kontrola()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_kapacita  integer;
  v_obsazeno  integer;
  v_zacatek   time;
  v_horizont  integer;
  v_max       integer;
  v_aktivnich integer;
begin
  -- Dva lidé klikající na totéž místo ve stejnou chvíli se seřadí za sebe.
  -- Bez zámku by kontrola kapacity prošla oběma a místo by se přebookovalo.
  perform pg_advisory_xact_lock(
    hashtextextended(new.jizdarna || '|' || new.datum::text || '|' || new.slot, 0)
  );

  if not public.je_clen() then
    raise exception 'Rezervovat může jen schválený člen stáje.'
      using errcode = 'check_violation';
  end if;

  select kapacita into v_kapacita
  from public.jizdarny where kod = new.jizdarna and aktivni;

  if v_kapacita is null then
    raise exception 'Tuhle jízdárnu nejde rezervovat.'
      using errcode = 'check_violation';
  end if;

  select zacatek into v_zacatek
  from public.sloty where kod = new.slot and aktivni;

  if v_zacatek is null then
    raise exception 'Tenhle čas nejde rezervovat.'
      using errcode = 'check_violation';
  end if;

  -- Do minulosti se nerezervuje.
  if (new.datum + v_zacatek) <= public.ted_cz() then
    raise exception 'Tenhle termín už začal nebo je po něm.'
      using errcode = 'check_violation';
  end if;

  select hodnota into v_horizont from public.nastaveni where klic = 'horizont_dnu';
  if new.datum > public.dnes_cz() + coalesce(v_horizont, 21) then
    raise exception 'Rezervovat jde nejvýš % dní dopředu.', coalesce(v_horizont, 21)
      using errcode = 'check_violation';
  end if;

  -- Termín zavřený stájí.
  if exists (
    select 1 from public.blokace b
    where b.datum = new.datum
      and (b.jizdarna is null or b.jizdarna = new.jizdarna)
      and (b.slot is null or b.slot = new.slot)
  ) then
    raise exception 'Tenhle termín má stáj zavřený.'
      using errcode = 'check_violation';
  end if;

  -- Volná kapacita.
  select count(*) into v_obsazeno
  from public.rezervace r
  where r.jizdarna = new.jizdarna and r.datum = new.datum and r.slot = new.slot;

  if v_obsazeno >= v_kapacita then
    raise exception 'Tenhle termín je už plně obsazený.'
      using errcode = 'check_violation';
  end if;

  -- Strop na počet budoucích rezervací jednoho člena.
  select hodnota into v_max from public.nastaveni where klic = 'max_aktivnich';
  select count(*) into v_aktivnich
  from public.rezervace r
  where r.uzivatel = new.uzivatel and r.datum >= public.dnes_cz();

  if v_aktivnich >= coalesce(v_max, 15) then
    raise exception 'Můžete mít najednou nejvýš % rezervací.', coalesce(v_max, 15)
      using errcode = 'check_violation';
  end if;

  return new;
end;
$fn$;

drop trigger if exists rezervace_kontrola on public.rezervace;
create trigger rezervace_kontrola
  before insert on public.rezervace
  for each row execute function public.rezervace_kontrola();

-- Rušit jde do začátku termínu. Správce kdykoli.
create or replace function public.rezervace_kontrola_zruseni()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_zacatek time;
  v_storno  integer;
begin
  if public.je_spravce() then
    return old;
  end if;

  select zacatek into v_zacatek from public.sloty where kod = old.slot;
  select hodnota into v_storno from public.nastaveni where klic = 'storno_minut';

  if (old.datum + v_zacatek) - (coalesce(v_storno, 0) || ' minutes')::interval
       <= public.ted_cz() then
    raise exception 'Rezervaci už nejde zrušit, termín začal.'
      using errcode = 'check_violation';
  end if;

  return old;
end;
$fn$;

drop trigger if exists rezervace_kontrola_zruseni on public.rezervace;
create trigger rezervace_kontrola_zruseni
  before delete on public.rezervace
  for each row execute function public.rezervace_kontrola_zruseni();


-- ---------------------------------------------------------------- kalendář
--
-- Jediný dotaz, ze kterého se kreslí mřížka. Rozhodnutí „kdo uvidí jména"
-- leží tady v databázi, ne v šabloně: nepřihlášený dostane jen počty.

create or replace function public.kalendar(od date, dokdy date)
returns table (
  jizdarna text,
  datum    date,
  slot     text,
  obsazeno integer,
  jmena    text[],
  moje_id  uuid
)
language sql
stable
security definer
set search_path = public
as $fn$
  select
    r.jizdarna,
    r.datum,
    r.slot,
    count(*)::integer as obsazeno,
    case
      when public.je_clen() then array_agg(
        trim(
          coalesce(nullif(p.jmeno, ''), 'Člen stáje') ||
          case when r.poznamka <> '' then ' · ' || r.poznamka else '' end
        )
        order by r.vytvoreno
      )
      else null
    end as jmena,
    -- Vlastní rezervace v tomhle slotu, ať se z kalendáře dá rovnou zrušit.
    -- `array_agg ... filter` místo `max()`, protože nad typem uuid se na
    -- `max()` spolehnout nedá.
    (array_agg(r.id) filter (where r.uzivatel = auth.uid()))[1] as moje_id
  from public.rezervace r
  left join public.profily p on p.id = r.uzivatel
  where r.datum between od and dokdy
  group by r.jizdarna, r.datum, r.slot;
$fn$;


-- ---------------------------------------------------------------- RLS
--
-- Od téhle chvíle platí: co není výslovně povolené, je zakázané.

alter table public.jizdarny  enable row level security;
alter table public.sloty     enable row level security;
alter table public.profily   enable row level security;
alter table public.rezervace enable row level security;
alter table public.blokace   enable row level security;
alter table public.oznameni  enable row level security;
alter table public.nastaveni enable row level security;

-- Číselníky si smí přečíst kdokoli, měnit je jen správce.
drop policy if exists jizdarny_cteni on public.jizdarny;
create policy jizdarny_cteni on public.jizdarny
  for select using (true);

drop policy if exists jizdarny_sprava on public.jizdarny;
create policy jizdarny_sprava on public.jizdarny
  for all using (public.je_spravce()) with check (public.je_spravce());

drop policy if exists sloty_cteni on public.sloty;
create policy sloty_cteni on public.sloty
  for select using (true);

drop policy if exists sloty_sprava on public.sloty;
create policy sloty_sprava on public.sloty
  for all using (public.je_spravce()) with check (public.je_spravce());

drop policy if exists nastaveni_cteni on public.nastaveni;
create policy nastaveni_cteni on public.nastaveni
  for select using (true);

drop policy if exists nastaveni_sprava on public.nastaveni;
create policy nastaveni_sprava on public.nastaveni
  for all using (public.je_spravce()) with check (public.je_spravce());

-- Profil vidí jeho majitel a správce. Nikdo jiný.
drop policy if exists profily_cteni on public.profily;
create policy profily_cteni on public.profily
  for select using (id = auth.uid() or public.je_spravce());

drop policy if exists profily_uprava on public.profily;
create policy profily_uprava on public.profily
  for update using (id = auth.uid() or public.je_spravce());

drop policy if exists profily_zalozeni on public.profily;
create policy profily_zalozeni on public.profily
  for insert with check (id = auth.uid());

drop policy if exists profily_smazani on public.profily;
create policy profily_smazani on public.profily
  for delete using (public.je_spravce());

-- Rezervace: řádky se jmény vidí jen členové. Nepřihlášený se k tabulce
-- nedostane vůbec, obsazenost mu vrátí funkce kalendar() jako holá čísla.
drop policy if exists rezervace_cteni on public.rezervace;
create policy rezervace_cteni on public.rezervace
  for select using (public.je_clen());

-- Zakládat jde jen sám za sebe. Zbytek pravidel hlídá trigger.
drop policy if exists rezervace_zalozeni on public.rezervace;
create policy rezervace_zalozeni on public.rezervace
  for insert with check (uzivatel = auth.uid() and public.je_clen());

drop policy if exists rezervace_zruseni on public.rezervace;
create policy rezervace_zruseni on public.rezervace
  for delete using (uzivatel = auth.uid() or public.je_spravce());

-- Blokace a oznámení: čte kdokoli, zapisuje správce.
drop policy if exists blokace_cteni on public.blokace;
create policy blokace_cteni on public.blokace
  for select using (true);

drop policy if exists blokace_sprava on public.blokace;
create policy blokace_sprava on public.blokace
  for all using (public.je_spravce()) with check (public.je_spravce());

drop policy if exists oznameni_cteni on public.oznameni;
create policy oznameni_cteni on public.oznameni
  for select using (true);

drop policy if exists oznameni_sprava on public.oznameni;
create policy oznameni_sprava on public.oznameni
  for all using (public.je_spravce()) with check (public.je_spravce());


-- ---------------------------------------------------------------- práva

-- Práva k tabulkám jsou schválně široká: skutečnou bránou jsou pravidla RLS
-- výše, která rozhodují řádek po řádku. Bez explicitního přidělení by systém
-- přestal fungovat na projektu s jinak nastavenými výchozími právy.
grant usage on schema public to anon, authenticated;

grant select on
  public.jizdarny, public.sloty, public.blokace, public.oznameni, public.nastaveni
  to anon, authenticated;

grant select, insert, update, delete on
  public.profily, public.rezervace, public.blokace, public.oznameni, public.nastaveni
  to authenticated;

revoke all on function public.kalendar(date, date) from public;
grant execute on function public.kalendar(date, date) to anon, authenticated;
grant execute on function public.je_clen()    to anon, authenticated;
grant execute on function public.je_spravce() to anon, authenticated;


-- =====================================================================
--  POSLEDNÍ KROK — první správce
--
--  Zaregistrujte se na webu (/rezervace/registrace) a pak sem doplňte
--  svůj e-mail a spusťte:
--
--    update public.profily set role = 'spravce', schvaleno = true
--    where id = (select id from auth.users where email = 'vas@email.cz');
--
--  Od té chvíle schvalujete další členy přímo na webu.
-- =====================================================================
