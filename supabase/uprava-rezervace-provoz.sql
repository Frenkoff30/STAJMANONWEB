-- =====================================================================
--  Úprava: provoz jízdáren podle koní, delší bloky a opakování
--
--  Co se mění:
--    * Jízdárna nemá „volná místa". Hala má jen doporučení, kolik koní
--      se v ní má potkat (8). U malých jízdáren se nic nedoporučuje.
--    * Rezervace nese počet koní a činnost (co se tam bude dělat).
--    * Rezervace jde udělat na několik navazujících hodin a opakovat
--      týdně klidně na celý rok — proto větší horizont i strop.
--
--  Pro databázi, kde už běží supabase/schema.sql. Spustit jednou:
--  Supabase → SQL Editor → New query → vložit celý soubor → Run.
--  Nic nesmaže. Jde pustit i opakovaně.
-- =====================================================================


-- ---------------------------------------------------------------- jízdárny
--
-- `kapacita` zůstává jako technický strop proti nesmyslům (někdo by si
-- jinak mohl do jednoho slotu naklikat stovky řádků). Nikde se neukazuje
-- a je schválně velká: kdo se do jízdárny vejde, si stáj řídí sama podle
-- doporučeného počtu koní.

alter table public.jizdarny
  add column if not exists doporuceni_koni integer not null default 0
  check (doporuceni_koni >= 0);

comment on column public.jizdarny.doporuceni_koni is
  'Doporučený počet koní v jednom čase. 0 = nic se nedoporučuje.';

update public.jizdarny set doporuceni_koni = 8, kapacita = 25 where kod = 'hala';
update public.jizdarny set doporuceni_koni = 0, kapacita = 25 where kod <> 'hala';


-- ---------------------------------------------------------------- rezervace
--
-- `serie` drží pohromadě rezervace založené jedním opakováním, aby se
-- daly zrušit najednou a ne po jedné padesátkrát.

alter table public.rezervace
  add column if not exists pocet_koni integer not null default 1
  check (pocet_koni between 1 and 20);

alter table public.rezervace add column if not exists serie uuid;

create index if not exists rezervace_serie_idx on public.rezervace (serie);


-- ---------------------------------------------------------------- pravidla
--
-- Opakovaný trénink na celý rok potřebuje horizont i strop, do kterých se
-- vejde. Stáj si obojí dál mění ve správě.

update public.nastaveni set hodnota = 400,
  popis = 'Na kolik dní dopředu jde rezervovat.'
  where klic = 'horizont_dnu' and hodnota < 400;

update public.nastaveni set hodnota = 400,
  popis = 'Kolik budoucích rezervací smí mít jeden člen zároveň.'
  where klic = 'max_aktivnich' and hodnota < 400;


-- ---------------------------------------------------------------- kalendář
--
-- Oproti původní verzi vrací navíc součet koní. Návratový typ se mění,
-- takže se funkce musí nejdřív zahodit.

drop function if exists public.kalendar(date, date);

create or replace function public.kalendar(od date, dokdy date)
returns table (
  jizdarna text,
  datum    date,
  slot     text,
  obsazeno integer,
  koni     integer,
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
    coalesce(sum(r.pocet_koni), 0)::integer as koni,
    case
      when public.je_clen() then array_agg(
        trim(
          coalesce(nullif(p.jmeno, ''), 'Člen stáje') ||
          ' · ' || r.pocet_koni ||
          case
            when r.pocet_koni = 1 then ' kůň'
            when r.pocet_koni between 2 and 4 then ' koně'
            else ' koní'
          end ||
          case when r.poznamka <> '' then ' · ' || r.poznamka else '' end
        )
        order by r.vytvoreno
      )
      else null
    end as jmena,
    (array_agg(r.id) filter (where r.uzivatel = auth.uid()))[1] as moje_id
  from public.rezervace r
  left join public.profily p on p.id = r.uzivatel
  where r.datum between od and dokdy
  group by r.jizdarna, r.datum, r.slot;
$fn$;

revoke all on function public.kalendar(date, date) from public;
grant execute on function public.kalendar(date, date) to anon, authenticated;
