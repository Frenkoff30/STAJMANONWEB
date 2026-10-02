-- =====================================================================
--  Úprava: provoz jízdáren podle koní, delší bloky a opakování
--
--  Co se mění:
--    * Jízdárna nemá „volná místa". Hala má jen doporučení, kolik koní
--      se v ní má potkat (8). U malých jízdáren se nic nedoporučuje.
--    * Rezervace nese počet koní a činnost (co se tam bude dělat).
--    * Rezervace jde udělat na několik navazujících hodin a opakovat
--      týdně klidně na celý rok. Stropy „dní dopředu" a „rezervací na
--      člena" se proto ruší úplně.
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
-- Strop „kolik dní dopředu" a „kolik rezervací na člena" se ruší. Pravidelný
-- trénink na celý rok se do nich nevešel a stáj si pořádek hlídá sama —
-- zbytečný strop by jen bránil v práci. Zůstává jen lhůta na zrušení.

delete from public.nastaveni where klic in ('horizont_dnu', 'max_aktivnich');

-- Kontrola rezervace bez obou stropů. Zbytek pravidel (člen, kapacita,
-- minulost, zavřený termín) platí dál.
create or replace function public.rezervace_kontrola()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_kapacita integer;
  v_obsazeno integer;
  v_zacatek  time;
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

  -- Volná kapacita jízdárny. Je schválně velká, jde o pojistku proti
  -- nesmyslu, ne o počítání míst.
  select count(*) into v_obsazeno
  from public.rezervace r
  where r.jizdarna = new.jizdarna and r.datum = new.datum and r.slot = new.slot;

  if v_obsazeno >= v_kapacita then
    raise exception 'V tomhle termínu už je zapsaných hodně jezdců.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$fn$;


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
