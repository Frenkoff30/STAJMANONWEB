-- =====================================================================
--  Úprava: kalendář akcí ve správě
--
--  Akce se nově zadávají jen na jednom místě, ve správě na webu
--  (/prihlasky/sprava → Nová akce). Kalendář na webu si je čte odtud,
--  redakce (Keystatic) už akce nemá.
--
--  Akce nemusí mít online přihlašování — pak je to jen záznam v kalendáři.
--
--  Pro databázi, kde už běží supabase/prihlasky.sql. Spustit jednou:
--  Supabase → SQL Editor → New query → vložit celý soubor → Run.
--  Nic nesmaže. Jde pustit i opakovaně.
-- =====================================================================

do $$
begin
  -- Druh akce do kalendáře (závody, drezura, tábor…). Formulář přihlášky
  -- se z něj odvozuje sám. Existujícím akcím se druh doplní podle typu
  -- formuláře, ale jen napoprvé, ať opakované spuštění nepřepíše ruční změny.
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'akce' and column_name = 'druh') then
    alter table public.akce add column druh text not null default 'jina';
    update public.akce set druh = case typ
      when 'tabor'       then 'tabor'
      when 'pobyt'       then 'pobyt'
      when 'hry'         then 'hry'
      when 'soustredeni' then 'soustredeni'
      else 'zavody'
    end;
  end if;
end $$;

alter table public.akce add column if not exists prihlasovani boolean not null default true;
alter table public.akce add column if not exists zvyraznit    boolean not null default false;
alter table public.akce add column if not exists rozpis_nazev text    not null default '';
alter table public.akce add column if not exists rozpis_url   text    not null default '';

alter table public.akce drop constraint if exists akce_druh_check;
alter table public.akce add constraint akce_druh_check check (druh in (
  'zavody', 'drezura', 'vsestrannost', 'sprezeni', 'zkousky',
  'hry', 'soustredeni', 'tabor', 'pobyt', 'chov', 'jina'
));


-- ---------------------------------------------------------------- soubory
--
-- Rozpisy k akcím (a později fotky k novinkám) se nahrávají do úložiště
-- Supabase. Číst je smí kdokoli (odkaz z webu), nahrávat jen správce.

insert into storage.buckets (id, name, public)
values ('soubory', 'soubory', true)
on conflict (id) do update set public = true;

drop policy if exists soubory_nahravani on storage.objects;
create policy soubory_nahravani on storage.objects
  for insert to authenticated
  with check (bucket_id = 'soubory' and public.je_spravce_prihlasek());

drop policy if exists soubory_uprava on storage.objects;
create policy soubory_uprava on storage.objects
  for update to authenticated
  using (bucket_id = 'soubory' and public.je_spravce_prihlasek())
  with check (bucket_id = 'soubory' and public.je_spravce_prihlasek());

drop policy if exists soubory_mazani on storage.objects;
create policy soubory_mazani on storage.objects
  for delete to authenticated
  using (bucket_id = 'soubory' and public.je_spravce_prihlasek());
