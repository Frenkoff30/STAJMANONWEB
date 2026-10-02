-- =====================================================================
--  Úprava: rozvrh po celých hodinách od 6:00 do 21:00
--
--  Místo dvou nestejných bloků ráno (6:30–8:30 a 8:30–9:00) má den
--  patnáct stejných hodin. Rezervace tak jdou skládat za sebe bez výjimek
--  a tažení v kalendáři funguje přes celý den.
--
--  Staré ranní bloky se nemažou, jen vypínají: visí na nich dosavadní
--  rezervace a blokace, které by se smazáním zmizely taky. Z kalendáře
--  tím pádem zmizí, ale historie zůstane.
--
--  Supabase → SQL Editor → New query → vložit celý soubor → Run.
--  Nic nesmaže. Jde pustit i opakovaně.
-- =====================================================================

-- Chybějící ranní hodiny. Zbytek dne už v rozvrhu je.
insert into public.sloty (kod, zacatek, konec, poradi) values
  ('0600-0700', '06:00', '07:00', 1),
  ('0700-0800', '07:00', '08:00', 2),
  ('0800-0900', '08:00', '09:00', 3)
on conflict (kod) do update
  set zacatek = excluded.zacatek,
      konec   = excluded.konec,
      poradi  = excluded.poradi,
      aktivni = true;

-- Pořadí zbytku dne, ať hodiny jdou za sebou.
update public.sloty set poradi = 4,  aktivni = true where kod = '0900-1000';
update public.sloty set poradi = 5,  aktivni = true where kod = '1000-1100';
update public.sloty set poradi = 6,  aktivni = true where kod = '1100-1200';
update public.sloty set poradi = 7,  aktivni = true where kod = '1200-1300';
update public.sloty set poradi = 8,  aktivni = true where kod = '1300-1400';
update public.sloty set poradi = 9,  aktivni = true where kod = '1400-1500';
update public.sloty set poradi = 10, aktivni = true where kod = '1500-1600';
update public.sloty set poradi = 11, aktivni = true where kod = '1600-1700';
update public.sloty set poradi = 12, aktivni = true where kod = '1700-1800';
update public.sloty set poradi = 13, aktivni = true where kod = '1800-1900';
update public.sloty set poradi = 14, aktivni = true where kod = '1900-2000';
update public.sloty set poradi = 15, aktivni = true where kod = '2000-2100';

-- Staré nestejné ranní bloky z kalendáře pryč.
update public.sloty set aktivni = false where kod in ('0630-0830', '0830-0900');
