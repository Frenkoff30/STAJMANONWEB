-- =====================================================================
--  Úprava: novinky ve správě webu + jeden účet pro stáj
--
--  1) Novinky se nově píšou ve správě webu (/prihlasky/sprava/novinky),
--     ne v redakci. Tři stávající novinky se sem přenesou.
--  2) Správce rezervací jízdárny je zároveň správcem webu. Stáj tak má
--     jeden účet (e-mail + heslo) na rezervace, akce, přihlášky i novinky.
--
--  Pro databázi, kde už běží schema.sql, prihlasky.sql a uprava-kalendar.sql.
--  Spustit jednou: Supabase → SQL Editor → New query → vložit → Run.
--  Nic nesmaže. Jde pustit i opakovaně.
-- =====================================================================

-- ---------------------------------------------------------------- správci
--
-- Do správy webu smí každý, kdo je v seznamu správců přihlášek, nebo je
-- schválený správce rezervací (profily.role = 'spravce').

create or replace function public.je_spravce_prihlasek()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.prihlasky_spravci where uzivatel = auth.uid()
  ) or public.je_spravce();
$fn$;


-- ---------------------------------------------------------------- novinky

create table if not exists public.novinky (
  id           uuid primary key default gen_random_uuid(),
  -- Adresa novinky /novinky/<slug>. Po zveřejnění se nemění (sdílení na FB).
  slug         text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  nadpis       text not null,
  datum        date not null default (timezone('Europe/Prague', now()))::date,
  text         text not null default '',
  foto_url     text not null default '',
  soubor_url   text not null default '',
  soubor_nazev text not null default '',
  odkaz_url    text not null default '',
  odkaz_nazev  text not null default '',
  vytvoreno    timestamptz not null default now()
);

create index if not exists novinky_datum_idx on public.novinky (datum desc);

alter table public.novinky enable row level security;

drop policy if exists novinky_cteni on public.novinky;
create policy novinky_cteni on public.novinky
  for select using (true);

drop policy if exists novinky_sprava on public.novinky;
create policy novinky_sprava on public.novinky
  for all using (public.je_spravce_prihlasek())
  with check (public.je_spravce_prihlasek());

grant select on public.novinky to anon, authenticated;
grant insert, update, delete on public.novinky to authenticated;


-- ---------------------------------------------------- přenos z redakce

insert into public.novinky
  (slug, nadpis, datum, text, soubor_url, soubor_nazev, odkaz_url, odkaz_nazev)
values
  ('jezdecke-hry-startovni-listiny', 'Jezdecké hry: startovní listiny', '2026-09-18', 'Startovní listiny na finále jezdeckých her v sobotu 19. září 2026 jsou ke stažení níže.', '/soubory/novinky/jezdecke-hry-startovni-listiny-2026-09-19.xlsx', 'Startovní listiny (XLSX)', '', ''),
  ('zmena-terminu-jezdeckych-her', 'Změna termínu jezdeckých her: nový termín je sobota 19. září 2026', '2026-09-09', 'Finále jezdeckých her proběhne v sobotu 19. září 2026. Na programu budou opět jízdy zručnosti a parkury: křížkový, 40/50 cm a 50/60 cm.

Vyhodnoceny budou celoroční soutěže Benjamínek 2026, Pony pohár 2026 a Dětský skokový pohár 2026. Těšíme se na viděnou!', '', '', '', ''),
  ('zveme-vas-na-finale-jezdeckych-her', 'Zveme vás v sobotu 19. září 2026 na finále jezdeckých her', '2026-09-15', 'Začátek soutěží v 10.00 hodin. Program: jízda zručnosti, jízda zručnosti se skoky, křížkový parkur, parkur 40/50 cm a 50/60 cm.

Celoroční vyhlášení žebříčků Benjamínek, Pony pohár a Dětský skokový pohár 2026. Přijďte si užít den určený pro děti a jejich čtyřnohé kamarády. Těšíme se.', '', '', '', '')
on conflict (slug) do nothing;
