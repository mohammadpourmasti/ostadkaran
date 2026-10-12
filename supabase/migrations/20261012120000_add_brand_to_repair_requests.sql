-- DRAFT FOR REVIEW - NOT APPLIED. Additive and transactional.
--
-- Persists the optional device brand with each repair request, atomically (same INSERT).
--
-- DEPLOYMENT ORDER
--   1. Review this file.
--   2. Apply it (Supabase SQL editor or `supabase db push`). It is additive: existing rows get brand = NULL
--      and the original 4-parameter function is left untouched, so the currently deployed app keeps working.
--   3. Verify (read-only): the column exists and both overloads are listed in pg_proc.
--   4. ONLY THEN deploy the app version whose server action sends p_brand. Deploying it earlier makes every
--      submission fail (no 5-parameter function yet).
--   5. A later, separate migration may drop the 4-parameter overload once nothing calls it.
--
-- ROLLBACK (manual, if ever needed after applying):
--   drop function public.insert_repair_request_limited(text, text, text, text, text);
--   alter table public.repair_requests drop constraint repair_requests_brand_length;
--   alter table public.repair_requests drop column brand;

begin;

-- 1. Nullable column + length check (NULL, or trimmed length 1..80).
alter table public.repair_requests
  add column if not exists brand text;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'repair_requests_brand_length'
      and conrelid = 'public.repair_requests'::regclass
  ) then
    alter table public.repair_requests
      add constraint repair_requests_brand_length
      check (brand is null or pg_catalog.char_length(pg_catalog.btrim(brand)) between 1 and 80);
  end if;
end
$$;

-- 2. New 5-parameter overload. No default for p_brand, so 4-argument calls still resolve to the original.
--    Body is the live 4-parameter function plus brand handling. Not SECURITY DEFINER; empty search_path.
create function public.insert_repair_request_limited(
  p_name text,
  p_phone text,
  p_appliance text,
  p_problem text,
  p_brand text
)
 returns text
 language plpgsql
 set search_path to ''
as $function$
declare
  v_name text;
  v_phone text;
  v_problem text;
  v_brand text;
  v_now timestamptz;
  v_count bigint;
begin
  v_name := pg_catalog.btrim(p_name);
  v_phone := pg_catalog.btrim(p_phone);
  v_problem := pg_catalog.btrim(p_problem);
  -- Empty or whitespace-only brand becomes NULL.
  v_brand := nullif(pg_catalog.btrim(p_brand), '');

  if p_name is null
     or p_phone is null
     or p_appliance is null
     or p_problem is null
     or pg_catalog.char_length(v_name) < 2
     or pg_catalog.char_length(v_name) > 80
     or pg_catalog.char_length(v_problem) < 10
     or pg_catalog.char_length(v_problem) > 1000
     or not (
       v_phone ~ '^09[0-9]{9}$'
       or v_phone ~ '^0[1-8][0-9]{9}$'
     )
     or p_appliance not in (
       'washing-machine',
       'refrigerator',
       'dishwasher',
       'television',
       'stove',
       'vacuum-cleaner',
       'air-conditioner',
       'other'
     )
     or (v_brand is not null and pg_catalog.char_length(v_brand) > 80)
  then
    return 'invalid_input';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'repair_requests:phone:' || v_phone,
      0
    )
  );

  v_now := pg_catalog.clock_timestamp();

  select pg_catalog.count(*)
  into v_count
  from public.repair_requests
  where phone = v_phone
    and created_at >= v_now - interval '1 hour';

  if v_count >= 3 then
    return 'rate_limited';
  end if;

  insert into public.repair_requests (
    name,
    phone,
    appliance,
    problem,
    brand
  )
  values (
    v_name,
    v_phone,
    p_appliance,
    v_problem,
    v_brand
  );

  return 'ok';
end;
$function$;

-- 3. Permissions: service_role only, matching the existing function. The 4-parameter function is not touched.
revoke all on function public.insert_repair_request_limited(text, text, text, text, text) from public;
revoke all on function public.insert_repair_request_limited(text, text, text, text, text) from anon;
revoke all on function public.insert_repair_request_limited(text, text, text, text, text) from authenticated;
grant execute on function public.insert_repair_request_limited(text, text, text, text, text) to service_role;

commit;
