-- =====================================================================
--  Úprava: akce si zavře jízdárnu
--
--  U akce jde zaškrtnout, že se po dobu jejího konání nemá dát rezervovat
--  jízdárna (třeba velká hala při dětských hrách). Z akce pak vznikne
--  blokace na každý její den a v kalendáři rezervací je místo volných
--  termínů vidět název akce.
--
--  Blokace si drží kód akce, ze které vznikla. Při změně termínu nebo
--  zrušení akce se podle něj staré blokace najdou a přepíší — ručně
--  zadané blokace (`akce` je prázdné) zůstanou nedotčené.
--
--  Pro databázi, kde už běží supabase/schema.sql i supabase/prihlasky.sql.
--  Supabase → SQL Editor → New query → vložit celý soubor → Run.
--  Nic nesmaže. Jde pustit i opakovaně.
-- =====================================================================

-- Co akce zavírá: prázdné = nic, `vse` = všechny jízdárny, jinak kód jízdárny.
alter table public.akce
  add column if not exists zavrit_jizdarnu text not null default '';

comment on column public.akce.zavrit_jizdarnu is
  'Prázdné = nezavírat, "vse" = všechny jízdárny, jinak kód jízdárny.';

-- Ze které akce blokace vznikla. Prázdné u ručně zadaných.
alter table public.blokace add column if not exists akce text;

create index if not exists blokace_akce_idx on public.blokace (akce);


-- ---------------------------------------------------------------- práva
--
-- Blokace zakládá správa akcí, kde je přihlášený správce přihlášek. Ten
-- nemusí být zároveň správcem rezervací, proto dostane na blokace vlastní
-- pravidlo. Běží to jen tam, kde obojí sdílí jednu databázi — jinak
-- funkce `je_spravce_prihlasek()` neexistuje a pravidlo se přeskočí.

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'je_spravce_prihlasek'
  ) then
    execute 'drop policy if exists blokace_sprava_akci on public.blokace';
    execute $p$
      create policy blokace_sprava_akci on public.blokace
        for all using (public.je_spravce_prihlasek())
        with check (public.je_spravce_prihlasek())
    $p$;
  end if;
end $$;
