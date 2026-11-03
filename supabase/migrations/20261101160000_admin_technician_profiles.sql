-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run.
--
-- PURPOSE
--   Technician management from inside the dashboard (managers only). Adds, WITHOUT touching public.repair_requests
--   or public.staff_profiles' shape:
--     * technician_profiles     - extra data for staff_profiles rows with role 'technician' (phone, notes).
--     * technician_specialties  - one row per (technician, appliance id): a normalised link table, so requests can
--                                 later be filtered or suggested by specialty with a plain join.
--   Passwords and credentials are NEVER stored here: accounts live in Supabase Auth only.
--
-- RULES (enforced in the database functions, not only in the UI)
--   * Only an ACTIVE manager may create, edit, activate or deactivate a technician. Operators and technicians cannot.
--   * No function changes anybody's role, so a technician cannot change their own role or anyone else's.
--   * Creating a profile requires an existing Auth user that has no staff profile yet (an existing staff member can
--     never be converted or overwritten). The Auth user itself is created by the server (Auth Admin API) right
--     before calling admin_create_technician; if this function fails the server deletes that Auth user again.
--   * Deactivating keeps all history and assignments; the assignment function already refuses inactive technicians.
--
-- PREREQUISITES
--   * 20261101100000 .. 20261101120000 and 20261101140000 (assignments) applied.
--
-- PERMISSIONS
--   * New tables: RLS enabled, no policies, all privileges revoked from anon/authenticated.
--   * Functions: SECURITY DEFINER, empty search_path, EXECUTE for 'authenticated' only (role checks inside).
--     admin_list_technicians_v2 is readable by managers AND operators (needed for the assignment picker); it returns
--     no phone numbers. Every other function here is manager-only.
--
-- HOW TO TEST (read-only checks after applying; try the actions on a TEST project first)
--   select rowsecurity from pg_tables where schemaname = 'public'
--     and tablename in ('technician_profiles', 'technician_specialties');                                -- both t
--   select count(*) from information_schema.role_table_grants where table_schema = 'public'
--     and table_name in ('technician_profiles', 'technician_specialties')
--     and grantee in ('anon', 'authenticated');                                                           -- 0
--   select has_function_privilege('anon', 'public.admin_create_technician(uuid, text, text, text[], text, boolean)', 'execute'); -- false
--
-- RISKS
--   * Foreign keys use ON DELETE RESTRICT: a technician with a profile cannot be deleted; deactivate instead.
--   * Phone numbers are unique among technicians (a duplicate raises SQLSTATE 23505).
--
-- ROLLBACK (manual, only if ever needed after applying; this deletes technician profile data)
--   drop function public.admin_set_technician_active(uuid, boolean);
--   drop function public.admin_update_technician(uuid, text, text, text[], text);
--   drop function public.admin_create_technician(uuid, text, text, text[], text, boolean);
--   drop function public.admin_get_technician(uuid);
--   drop function public.admin_list_technician_staff(text, text, integer, integer);
--   drop function public.admin_list_technicians_v2(boolean);
--   drop function public.admin_require_manager();
--   drop table public.technician_specialties;
--   drop table public.technician_profiles;

begin;

-- 1. Prerequisites and incompatible-shape detection.
do $$
declare
  v_matching integer;
begin
  if to_regclass('public.staff_profiles') is null
     or to_regclass('public.repair_request_assignments') is null
     or to_regprocedure('public.admin_require_staff()') is null then
    raise exception 'Apply 20261101100000 .. 20261101140000 first. Aborting without changes.';
  end if;

  if to_regclass('public.technician_profiles') is not null then
    select count(*) into v_matching
      from information_schema.columns
     where table_schema = 'public' and table_name = 'technician_profiles'
       and (column_name, data_type) in (('user_id', 'uuid'), ('phone', 'text'), ('notes', 'text'),
                                        ('created_by', 'uuid'), ('created_at', 'timestamp with time zone'),
                                        ('updated_at', 'timestamp with time zone'));
    if v_matching <> 6 then
      raise exception 'public.technician_profiles already exists with an unexpected shape. Aborting without changes.';
    end if;
  end if;

  if to_regclass('public.technician_specialties') is not null then
    select count(*) into v_matching
      from information_schema.columns
     where table_schema = 'public' and table_name = 'technician_specialties'
       and (column_name, data_type) in (('user_id', 'uuid'), ('appliance', 'text'),
                                        ('created_at', 'timestamp with time zone'));
    if v_matching <> 3 then
      raise exception 'public.technician_specialties already exists with an unexpected shape. Aborting without changes.';
    end if;
  end if;
end
$$;

-- 2. Tables.
create table if not exists public.technician_profiles (
  user_id uuid primary key references public.staff_profiles (user_id) on delete restrict,
  phone text check (phone is null or phone ~ '^09[0-9]{9}$'),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists technician_profiles_phone_key
  on public.technician_profiles (phone) where phone is not null;

create table if not exists public.technician_specialties (
  user_id uuid not null references public.technician_profiles (user_id) on delete restrict,
  appliance text not null check (appliance ~ '^[a-z][a-z-]{0,39}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, appliance)
);

create index if not exists technician_specialties_appliance_idx
  on public.technician_specialties (appliance, user_id);

alter table public.technician_profiles enable row level security;
alter table public.technician_specialties enable row level security;
revoke all on table public.technician_profiles from anon, authenticated;
revoke all on table public.technician_specialties from anon, authenticated;

-- 3. Manager-only guard (internal helper).
create or replace function public.admin_require_manager()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if public.admin_require_staff() <> 'manager' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
end
$function$;

-- 4. Technicians for the assignment picker / filters (managers and operators; no phone numbers).
create or replace function public.admin_list_technicians_v2(p_only_active boolean default true)
returns table (user_id uuid, full_name text, is_active boolean, specialties text[])
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select sp.user_id,
           sp.full_name,
           sp.is_active,
           coalesce((select pg_catalog.array_agg(ts.appliance order by ts.appliance)
                       from public.technician_specialties ts
                      where ts.user_id = sp.user_id), '{}'::text[])
      from public.staff_profiles sp
     where sp.role = 'technician'
       and (not coalesce(p_only_active, true) or sp.is_active)
     order by sp.full_name, sp.user_id;
end
$function$;

-- 5. Staff page list (manager only). p_active: null = all, 'active', 'inactive'.
create or replace function public.admin_list_technician_staff(
  p_search text default null,
  p_active text default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  full_name text,
  is_active boolean,
  phone text,
  specialties text[],
  assigned_total bigint,
  in_progress bigint,
  completed bigint,
  open_total bigint,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 200);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_term text := nullif(pg_catalog.btrim(coalesce(p_search, '')), '');
  v_pattern text;
begin
  perform public.admin_require_manager();

  if p_active is not null and p_active not in ('active', 'inactive') then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;

  if v_term is not null then
    v_term := pg_catalog.left(v_term, 64);
    v_pattern := '%' ||
      pg_catalog.replace(
        pg_catalog.replace(
          pg_catalog.replace(v_term, '\', '\\'),
          '%', '\%'),
        '_', '\_') || '%';
  end if;

  return query
    select sp.user_id,
           sp.full_name,
           sp.is_active,
           tp.phone,
           coalesce((select pg_catalog.array_agg(ts.appliance order by ts.appliance)
                       from public.technician_specialties ts
                      where ts.user_id = sp.user_id), '{}'::text[]),
           coalesce(st.assigned_total, 0),
           coalesce(st.in_progress, 0),
           coalesce(st.completed, 0),
           coalesce(st.open_total, 0),
           sp.created_at,
           pg_catalog.count(*) over ()
      from public.staff_profiles sp
      left join public.technician_profiles tp on tp.user_id = sp.user_id
      left join lateral (
        select pg_catalog.count(*) as assigned_total,
               pg_catalog.count(*) filter (where r.status = 'in_progress') as in_progress,
               pg_catalog.count(*) filter (where r.status = 'completed') as completed,
               pg_catalog.count(*) filter (where r.status in ('new', 'contacted', 'in_progress')) as open_total
          from public.repair_request_assignments a
          join public.repair_requests r on r.id = a.request_id
         where a.technician_id = sp.user_id
      ) st on true
     where sp.role = 'technician'
       and (p_active is null
            or (p_active = 'active' and sp.is_active)
            or (p_active = 'inactive' and not sp.is_active))
       and (v_pattern is null
            or sp.full_name ilike v_pattern escape '\'
            or tp.phone like v_pattern escape '\')
     order by sp.is_active desc, sp.full_name, sp.user_id
     limit v_limit offset v_offset;
end
$function$;

-- 6. One technician (manager only), same numbers plus notes.
create or replace function public.admin_get_technician(p_user_id uuid)
returns table (
  user_id uuid,
  full_name text,
  is_active boolean,
  phone text,
  notes text,
  specialties text[],
  assigned_total bigint,
  in_progress bigint,
  completed bigint,
  open_total bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_manager();

  return query
    select sp.user_id,
           sp.full_name,
           sp.is_active,
           tp.phone,
           tp.notes,
           coalesce((select pg_catalog.array_agg(ts.appliance order by ts.appliance)
                       from public.technician_specialties ts
                      where ts.user_id = sp.user_id), '{}'::text[]),
           coalesce(st.assigned_total, 0),
           coalesce(st.in_progress, 0),
           coalesce(st.completed, 0),
           coalesce(st.open_total, 0),
           sp.created_at
      from public.staff_profiles sp
      left join public.technician_profiles tp on tp.user_id = sp.user_id
      left join lateral (
        select pg_catalog.count(*) as assigned_total,
               pg_catalog.count(*) filter (where r.status = 'in_progress') as in_progress,
               pg_catalog.count(*) filter (where r.status = 'completed') as completed,
               pg_catalog.count(*) filter (where r.status in ('new', 'contacted', 'in_progress')) as open_total
          from public.repair_request_assignments a
          join public.repair_requests r on r.id = a.request_id
         where a.technician_id = sp.user_id
      ) st on true
     where sp.role = 'technician' and sp.user_id = p_user_id;
end
$function$;

-- 7. Create the profile of an Auth user that the server has just created. Returns the user id.
create or replace function public.admin_create_technician(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_specialties text[],
  p_notes text,
  p_is_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_name text := pg_catalog.btrim(coalesce(p_full_name, ''));
  v_notes text := nullif(pg_catalog.btrim(coalesce(p_notes, '')), '');
  v_specialties text[] := coalesce(p_specialties, '{}'::text[]);
  v_item text;
begin
  perform public.admin_require_manager();

  if pg_catalog.char_length(v_name) < 2 or pg_catalog.char_length(v_name) > 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if p_phone is null or p_phone !~ '^09[0-9]{9}$' then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if v_notes is not null and pg_catalog.char_length(v_notes) > 1000 then
    raise exception 'invalid_notes' using errcode = '22023';
  end if;
  if pg_catalog.cardinality(v_specialties) < 1 or pg_catalog.cardinality(v_specialties) > 20 then
    raise exception 'invalid_specialties' using errcode = '22023';
  end if;
  foreach v_item in array v_specialties loop
    if v_item is null or v_item !~ '^[a-z][a-z-]{0,39}$' then
      raise exception 'invalid_specialties' using errcode = '22023';
    end if;
  end loop;

  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'invalid_user' using errcode = '22023';
  end if;
  if exists (select 1 from public.staff_profiles sp where sp.user_id = p_user_id) then
    raise exception 'already_staff' using errcode = '23505';
  end if;

  insert into public.staff_profiles (user_id, full_name, role, is_active)
  values (p_user_id, v_name, 'technician', coalesce(p_is_active, true));

  insert into public.technician_profiles (user_id, phone, notes, created_by)
  values (p_user_id, p_phone, v_notes, (select auth.uid()));

  insert into public.technician_specialties (user_id, appliance)
  select p_user_id, s from pg_catalog.unnest(v_specialties) as s
  on conflict do nothing;

  return p_user_id;
end
$function$;

-- 8. Edit name, phone, specialties and notes of an existing technician (role and active flag are NOT changed here).
create or replace function public.admin_update_technician(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_specialties text[],
  p_notes text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_name text := pg_catalog.btrim(coalesce(p_full_name, ''));
  v_notes text := nullif(pg_catalog.btrim(coalesce(p_notes, '')), '');
  v_specialties text[] := coalesce(p_specialties, '{}'::text[]);
  v_item text;
begin
  perform public.admin_require_manager();

  if pg_catalog.char_length(v_name) < 2 or pg_catalog.char_length(v_name) > 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if p_phone is null or p_phone !~ '^09[0-9]{9}$' then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if v_notes is not null and pg_catalog.char_length(v_notes) > 1000 then
    raise exception 'invalid_notes' using errcode = '22023';
  end if;
  if pg_catalog.cardinality(v_specialties) < 1 or pg_catalog.cardinality(v_specialties) > 20 then
    raise exception 'invalid_specialties' using errcode = '22023';
  end if;
  foreach v_item in array v_specialties loop
    if v_item is null or v_item !~ '^[a-z][a-z-]{0,39}$' then
      raise exception 'invalid_specialties' using errcode = '22023';
    end if;
  end loop;

  perform 1 from public.staff_profiles sp where sp.user_id = p_user_id for update;
  if not found then
    raise exception 'technician_not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.staff_profiles sp where sp.user_id = p_user_id and sp.role = 'technician') then
    raise exception 'not_technician' using errcode = '22023';
  end if;

  update public.staff_profiles set full_name = v_name where user_id = p_user_id;

  insert into public.technician_profiles (user_id, phone, notes, created_by)
  values (p_user_id, p_phone, v_notes, (select auth.uid()))
  on conflict (user_id) do update
    set phone = excluded.phone, notes = excluded.notes, updated_at = pg_catalog.now();

  delete from public.technician_specialties ts
   where ts.user_id = p_user_id and ts.appliance <> all (v_specialties);

  insert into public.technician_specialties (user_id, appliance)
  select p_user_id, s from pg_catalog.unnest(v_specialties) as s
  on conflict do nothing;
end
$function$;

-- 9. Activate / deactivate. Returns the number of OPEN requests currently assigned to the technician.
create or replace function public.admin_set_technician_active(p_user_id uuid, p_active boolean)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_open bigint;
begin
  perform public.admin_require_manager();

  if p_active is null then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;

  perform 1 from public.staff_profiles sp where sp.user_id = p_user_id for update;
  if not found then
    raise exception 'technician_not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.staff_profiles sp where sp.user_id = p_user_id and sp.role = 'technician') then
    raise exception 'not_technician' using errcode = '22023';
  end if;

  update public.staff_profiles set is_active = p_active where user_id = p_user_id;

  select pg_catalog.count(*) into v_open
    from public.repair_request_assignments a
    join public.repair_requests r on r.id = a.request_id
   where a.technician_id = p_user_id and r.status in ('new', 'contacted', 'in_progress');

  return pg_catalog.jsonb_build_object('is_active', p_active, 'open_assigned', v_open);
end
$function$;

-- 10. Permissions: authenticated only; the internal guard is not exposed.
revoke all on function public.admin_require_manager() from public, anon, authenticated;
revoke all on function public.admin_list_technicians_v2(boolean) from public, anon, authenticated;
revoke all on function public.admin_list_technician_staff(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_get_technician(uuid) from public, anon, authenticated;
revoke all on function public.admin_create_technician(uuid, text, text, text[], text, boolean) from public, anon, authenticated;
revoke all on function public.admin_update_technician(uuid, text, text, text[], text) from public, anon, authenticated;
revoke all on function public.admin_set_technician_active(uuid, boolean) from public, anon, authenticated;

grant execute on function public.admin_list_technicians_v2(boolean) to authenticated;
grant execute on function public.admin_list_technician_staff(text, text, integer, integer) to authenticated;
grant execute on function public.admin_get_technician(uuid) to authenticated;
grant execute on function public.admin_create_technician(uuid, text, text, text[], text, boolean) to authenticated;
grant execute on function public.admin_update_technician(uuid, text, text, text[], text) to authenticated;
grant execute on function public.admin_set_technician_active(uuid, boolean) to authenticated;

commit;
