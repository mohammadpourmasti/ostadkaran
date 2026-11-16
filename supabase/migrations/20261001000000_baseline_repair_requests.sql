-- BASELINE for FRESH databases only. On the live project this is a no-op: public.repair_requests already exists
-- (verified against the live schema: columns, CHECKs and the phone index below match it exactly).
--
-- PURPOSE
--   public.repair_requests (and the original 4-parameter insert function) were created by hand in the live
--   Supabase project and never recorded as a migration. Every later migration (brand column, dashboard notes,
--   assignments, reports) assumes the table exists, so a new project could not be built from this folder.
--   This file creates the table with the shape those migrations check for:
--     id uuid, created_at timestamptz, name / phone / appliance / problem / status / brand text.
--
-- ORDER
--   Must run BEFORE 20261012120000_add_brand_to_repair_requests.sql (its name sorts earlier on purpose).
--
-- SAFETY
--   * If public.repair_requests already exists (the live project) this does NOTHING except print a notice.
--   * Nothing is dropped or altered. The 4-parameter insert function is NOT recreated: the app only calls the
--     5-parameter overload from the brand migration.
--   * The CHECKs mirror lib/repair-request/validation.ts and the 5-parameter function, and were compared with the live
--     table's constraints, defaults and indexes.
--
-- PERMISSIONS
--   RLS enabled, no policies, all privileges revoked from anon/authenticated. The site writes with the
--   server-only secret key (via insert_repair_request_limited) and the dashboard reads through its
--   SECURITY DEFINER functions.
--
-- ROLLBACK (only on a fresh database where this created the table)
--   drop table public.repair_requests;

begin;

do $$
begin
  if to_regclass('public.repair_requests') is not null then
    raise notice 'public.repair_requests already exists; baseline skipped.';
    return;
  end if;

  create table public.repair_requests (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null
      check (char_length(btrim(name)) between 2 and 80),
    phone text not null
      check (phone ~ '^09[0-9]{9}$' or phone ~ '^0[1-8][0-9]{9}$'),
    appliance text not null
      check (appliance in (
        'washing-machine', 'refrigerator', 'dishwasher', 'television',
        'stove', 'vacuum-cleaner', 'air-conditioner', 'other'
      )),
    problem text not null
      check (char_length(btrim(problem)) between 10 and 1000),
    status text not null default 'new'
      check (status in ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
    brand text,
    constraint repair_requests_brand_length
      check (brand is null or char_length(btrim(brand)) between 1 and 80)
  );

  -- Serves the per-phone hourly limit inside insert_repair_request_limited. (The live table has no separate
  -- created_at index, so none is created here either.)
  create index repair_requests_phone_created_at_idx on public.repair_requests (phone, created_at desc);

  alter table public.repair_requests enable row level security;
  revoke all on table public.repair_requests from anon, authenticated;
end
$$;

commit;
