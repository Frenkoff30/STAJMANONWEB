-- =====================================================================
--  Úprava přihlášek: platba na místě + povinný klub u jezdeckých her
--
--  Pro databázi, kde už běží supabase/prihlasky.sql. Spustit jednou:
--  Supabase → SQL Editor → New query → vložit celý soubor → Run.
--  Nic nesmaže a ukázkové akce znovu nezakládá. Jde pustit i opakovaně.
-- =====================================================================

alter table public.prihlasky drop constraint if exists prihlasky_platce_check;
alter table public.prihlasky add constraint prihlasky_platce_check
  check (platce in ('osoba', 'firma', 'misto'));

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
