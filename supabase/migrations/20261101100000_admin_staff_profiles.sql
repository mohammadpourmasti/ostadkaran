-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run.
--
-- PURPOSE
--   Staff profiles for the admin dashboard. A Supabase Auth account alone grants NO access: the dashboard only
--   admits a user that has an ACTIVE row here with role 'manager' or 'operator' ('technician' is stored but is
--   not admitted to request management in version 1).
--
-- PREREQUISITES
--   * Supabase Auth enabled (schema auth.users exists).
--   * Apply BEFORE 20261101110000 and 20261101120000.
--
-- PERMISSIONS
--   * anon:          nothing.
--   * authenticated: SELECT on the four profile columns, restricted by RLS to the user's OWN row. No INSERT,
--                    UPDATE or DELETE: profiles are created/changed by the owner in the Supabase SQL editor
--                    (see supabase/admin-dashboard-setup.md), never from the app.
--   * service_role:  unchanged (bypasses RLS as usual).
--
-- RLS POLICY
--   "Staff can read their own profile": select, authenticated, user_id = auth.uid().
--
-- HOW TO TEST (read-only, after applying)
--   select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = 'staff_profiles';
--   select grantee, privilege_type from information_schema.role_table_grants
--     where table_schema = 'public' and table_name = 'staff_profiles';      -- expect only authenticated/SELECT (+ postgres/service_role)
--   As a signed-in non-staff user: select * from public.staff_profiles;   -- expect 0 rows
--
-- RISKS
--   * If a table named public.staff_profiles already exists with a different shape this migration STOPS with an
--     explicit error instead of altering it.
--
-- ROLLBACK (manual, only if ever needed after applying)
--   drop table public.staff_profiles;
--   drop function public.staff_profiles_touch_updated_at();

begin;

-- 1. Refuse to continue if an existing table has an incompatible shape.
do $$
declare
  v_matching integer;
begin
  if to_regclass('public.staff_profiles') is not null then
    select count(*)
      into v_matching
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'staff_profiles'
       and (column_name, data_type) in (
         ('user_id', 'uuid'),
         ('full_name', 'text'),
         ('role', 'text'),
         ('is_active', 'boolean'),
         ('created_at', 'timestamp with time zone'),
         ('updated_at', 'timestamp with time zone')
       );

    if v_matching <> 6 then
      raise exception
        'public.staff_profiles already exists but does not have the expected columns (user_id uuid, full_name text, role text, is_active boolean, created_at timestamptz, updated_at timestamptz). Aborting without changes.';
    end if;
  end if;
end
$$;

-- 2. Table.
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null
    check (char_length(btrim(full_name)) between 2 and 80),
  role text not null
    check (role in ('manager', 'operator', 'technician')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Keep updated_at honest.
create or replace function public.staff_profiles_touch_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end
$function$;

drop trigger if exists staff_profiles_touch_updated_at on public.staff_profiles;
create trigger staff_profiles_touch_updated_at
  before update on public.staff_profiles
  for each row
  execute function public.staff_profiles_touch_updated_at();

-- 4. RLS + minimal grants.
alter table public.staff_profiles enable row level security;

revoke all on table public.staff_profiles from anon, authenticated;
grant select (user_id, full_name, role, is_active) on table public.staff_profiles to authenticated;

drop policy if exists "Staff can read their own profile" on public.staff_profiles;
create policy "Staff can read their own profile"
  on public.staff_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

commit;
