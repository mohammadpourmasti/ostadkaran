-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run.
--
-- PURPOSE
--   Technician assignment for repair requests, WITHOUT touching public.repair_requests (no new column, statuses
--   unchanged, insert_repair_request_limited untouched):
--     * repair_request_assignments        - the CURRENT responsible technician of a request (one row per request).
--     * repair_request_assignment_events  - append-only history: previous technician, new technician, who, when, note.
--   Staff accounts with role 'technician' already fit public.staff_profiles (migration 20261101100000).
--
-- RULES (enforced in the database functions, not only in the UI)
--   * manager:  assign, change and remove the assignment.
--   * operator: assign and change; may NOT remove an assignment.
--   * technician (and any non-staff user): no access at all. They cannot assign themselves and cannot read requests.
--   * only an ACTIVE staff profile with role 'technician' can be chosen as the responsible technician.
--   * a completed or cancelled request is closed: its technician can no longer be changed, so historical results
--     ("completed by X") stay attached to the technician who really handled it.
--   * the assignment row and its history row are written by one function = one transaction, with the request row
--     locked, so two people cannot interleave.
--
-- PREREQUISITES
--   * 20261101100000, 20261101110000 and 20261101120000 applied.
--   * public.repair_requests.id is uuid (checked below; the migration stops with a clear error otherwise).
--
-- PERMISSIONS
--   * Both new tables: RLS enabled, NO policies, all privileges revoked from anon/authenticated (only the
--     SECURITY DEFINER functions below touch them).
--   * Functions: SECURITY DEFINER, empty search_path, role check first, EXECUTE for 'authenticated' only.
--
-- HOW TO TEST (read-only checks after applying; try the actions on a TEST project first)
--   select rowsecurity from pg_tables where schemaname = 'public'
--     and tablename in ('repair_request_assignments', 'repair_request_assignment_events');                -- both t
--   select count(*) from information_schema.role_table_grants where table_schema = 'public'
--     and table_name in ('repair_request_assignments', 'repair_request_assignment_events')
--     and grantee in ('anon', 'authenticated');                                                           -- 0
--   select has_function_privilege('anon', 'public.admin_list_technicians(boolean)', 'execute');            -- false
--   As a signed-in technician account every admin_* call must fail with not_authorized.
--
-- RISKS
--   * Foreign keys use ON DELETE RESTRICT: a technician who has assignments or history cannot be deleted; set
--     is_active = false instead.
--   * admin_list_repair_requests_v2 is added next to the original admin_list_repair_requests (kept unchanged).
--
-- ROLLBACK (manual, only if ever needed after applying; this deletes assignment data)
--   drop function public.admin_assign_technician(uuid, uuid, text);
--   drop function public.admin_list_assignment_events(uuid);
--   drop function public.admin_get_request_assignment(uuid);
--   drop function public.admin_list_technicians(boolean);
--   drop function public.admin_list_repair_requests_v2(text, text, text, timestamptz, timestamptz, text, text, integer, integer);
--   drop table public.repair_request_assignment_events;
--   drop table public.repair_request_assignments;

begin;

-- 1. Prerequisites and incompatible-shape detection.
do $$
declare
  v_matching integer;
begin
  if to_regclass('public.repair_requests') is null
     or to_regclass('public.staff_profiles') is null
     or to_regclass('public.repair_request_notes') is null
     or to_regprocedure('public.admin_require_staff()') is null then
    raise exception 'Apply 20261101100000, 20261101110000 and 20261101120000 first. Aborting without changes.';
  end if;

  select count(*) into v_matching
    from information_schema.columns
   where table_schema = 'public' and table_name = 'repair_requests'
     and (column_name, data_type) in (('id', 'uuid'), ('created_at', 'timestamp with time zone'), ('status', 'text'),
                                      ('name', 'text'), ('phone', 'text'), ('appliance', 'text'), ('problem', 'text'), ('brand', 'text'));
  if v_matching <> 8 then
    raise exception 'public.repair_requests does not have the expected columns. Aborting without changes.';
  end if;

  if to_regclass('public.repair_request_assignments') is not null then
    select count(*) into v_matching
      from information_schema.columns
     where table_schema = 'public' and table_name = 'repair_request_assignments'
       and (column_name, data_type) in (('request_id', 'uuid'), ('technician_id', 'uuid'), ('assigned_by', 'uuid'),
                                        ('assigned_at', 'timestamp with time zone'), ('updated_at', 'timestamp with time zone'));
    if v_matching <> 5 then
      raise exception 'public.repair_request_assignments already exists with an unexpected shape. Aborting without changes.';
    end if;
  end if;

  if to_regclass('public.repair_request_assignment_events') is not null then
    select count(*) into v_matching
      from information_schema.columns
     where table_schema = 'public' and table_name = 'repair_request_assignment_events'
       and (column_name, data_type) in (('id', 'uuid'), ('request_id', 'uuid'), ('from_technician_id', 'uuid'),
                                        ('to_technician_id', 'uuid'), ('actor_id', 'uuid'), ('note', 'text'),
                                        ('created_at', 'timestamp with time zone'));
    if v_matching <> 7 then
      raise exception 'public.repair_request_assignment_events already exists with an unexpected shape. Aborting without changes.';
    end if;
  end if;
end
$$;

-- 2. Current assignment (one row per request; removing an assignment deletes the row, the history keeps the fact).
create table if not exists public.repair_request_assignments (
  request_id uuid primary key references public.repair_requests (id) on delete restrict,
  technician_id uuid not null references public.staff_profiles (user_id) on delete restrict,
  assigned_by uuid not null references auth.users (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists repair_request_assignments_technician_idx
  on public.repair_request_assignments (technician_id);

-- 3. Append-only history.
create table if not exists public.repair_request_assignment_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.repair_requests (id) on delete restrict,
  from_technician_id uuid references public.staff_profiles (user_id) on delete restrict,
  to_technician_id uuid references public.staff_profiles (user_id) on delete restrict,
  actor_id uuid not null references auth.users (id) on delete restrict,
  note text check (note is null or char_length(btrim(note)) between 1 and 500),
  created_at timestamptz not null default now(),
  constraint repair_request_assignment_events_changed check (from_technician_id is distinct from to_technician_id)
);

create index if not exists repair_request_assignment_events_request_idx
  on public.repair_request_assignment_events (request_id, created_at desc);
create index if not exists repair_request_assignment_events_to_idx
  on public.repair_request_assignment_events (to_technician_id, created_at desc);
create index if not exists repair_request_assignment_events_created_idx
  on public.repair_request_assignment_events (created_at desc);

alter table public.repair_request_assignments enable row level security;
alter table public.repair_request_assignment_events enable row level security;
revoke all on table public.repair_request_assignments from anon, authenticated;
revoke all on table public.repair_request_assignment_events from anon, authenticated;

-- 4. Technicians (for the assignment picker and report filters).
create or replace function public.admin_list_technicians(p_only_active boolean default true)
returns table (user_id uuid, full_name text, is_active boolean)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select sp.user_id, sp.full_name, sp.is_active
      from public.staff_profiles sp
     where sp.role = 'technician'
       and (not coalesce(p_only_active, true) or sp.is_active)
     order by sp.full_name, sp.user_id;
end
$function$;

-- 5. Current assignment of one request (0 rows = unassigned).
create or replace function public.admin_get_request_assignment(p_request_id uuid)
returns table (technician_id uuid, technician_name text, technician_active boolean, assigned_at timestamptz, assigned_by_name text)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select a.technician_id, t.full_name, t.is_active, a.assigned_at, b.full_name
      from public.repair_request_assignments a
      join public.staff_profiles t on t.user_id = a.technician_id
      left join public.staff_profiles b on b.user_id = a.assigned_by
     where a.request_id = p_request_id;
end
$function$;

-- 6. Assignment history of one request (newest first).
create or replace function public.admin_list_assignment_events(p_request_id uuid)
returns table (
  id uuid,
  created_at timestamptz,
  from_technician_id uuid,
  from_name text,
  to_technician_id uuid,
  to_name text,
  actor_name text,
  note text
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select e.id, e.created_at, e.from_technician_id, f.full_name, e.to_technician_id, t.full_name, a.full_name, e.note
      from public.repair_request_assignment_events e
      left join public.staff_profiles f on f.user_id = e.from_technician_id
      left join public.staff_profiles t on t.user_id = e.to_technician_id
      left join public.staff_profiles a on a.user_id = e.actor_id
     where e.request_id = p_request_id
     order by e.created_at desc, e.id;
end
$function$;

-- 7. Assign / change / remove. p_technician_id = null removes the assignment (manager only).
create or replace function public.admin_assign_technician(
  p_request_id uuid,
  p_technician_id uuid,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_role text;
  v_status text;
  v_current uuid;
  v_note text := nullif(pg_catalog.btrim(coalesce(p_note, '')), '');
begin
  v_role := public.admin_require_staff();

  if v_note is not null and pg_catalog.char_length(v_note) > 500 then
    raise exception 'invalid_note' using errcode = '22023';
  end if;

  -- Lock the request first: concurrent assignments and status changes on the same request are serialised.
  select r.status into v_status
    from public.repair_requests r
   where r.id = p_request_id
     for update;

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if v_status in ('completed', 'cancelled') then
    raise exception 'request_closed' using errcode = '22023';
  end if;

  select a.technician_id into v_current
    from public.repair_request_assignments a
   where a.request_id = p_request_id;

  if p_technician_id is null then
    if v_role <> 'manager' then
      raise exception 'not_allowed' using errcode = '42501';
    end if;
    if v_current is null then
      raise exception 'assignment_unchanged' using errcode = '22023';
    end if;

    delete from public.repair_request_assignments where request_id = p_request_id;
  else
    if not exists (
      select 1 from public.staff_profiles sp
       where sp.user_id = p_technician_id and sp.role = 'technician' and sp.is_active
    ) then
      raise exception 'invalid_technician' using errcode = '22023';
    end if;

    if v_current is not distinct from p_technician_id then
      raise exception 'assignment_unchanged' using errcode = '22023';
    end if;

    insert into public.repair_request_assignments (request_id, technician_id, assigned_by)
    values (p_request_id, p_technician_id, (select auth.uid()))
    on conflict (request_id) do update
      set technician_id = excluded.technician_id,
          assigned_by = excluded.assigned_by,
          assigned_at = pg_catalog.now(),
          updated_at = pg_catalog.now();
  end if;

  insert into public.repair_request_assignment_events (request_id, from_technician_id, to_technician_id, actor_id, note)
  values (p_request_id, v_current, p_technician_id, (select auth.uid()), v_note);

  return p_technician_id;
end
$function$;

-- 8. List v2: same as admin_list_repair_requests plus a technician filter and the technician columns.
--    p_technician: null = all, 'none' = unassigned, otherwise a technician's user id.
create or replace function public.admin_list_repair_requests_v2(
  p_search text default null,
  p_status text default null,
  p_appliance text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_technician text default null,
  p_sort text default 'newest',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  created_at timestamptz,
  name text,
  phone text,
  appliance text,
  brand text,
  status text,
  problem_preview text,
  technician_id uuid,
  technician_name text,
  total_count bigint
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_term text := nullif(pg_catalog.btrim(coalesce(p_search, '')), '');
  v_pattern text;
  v_mode text;
  v_tech uuid;
begin
  perform public.admin_require_staff();

  if p_technician is null or p_technician = '' then
    v_mode := 'all';
  elsif p_technician = 'none' then
    v_mode := 'none';
  elsif p_technician ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    v_mode := 'one';
    v_tech := p_technician::uuid;
  else
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
    select r.id,
           r.created_at,
           r.name,
           r.phone,
           r.appliance,
           r.brand,
           r.status,
           pg_catalog.left(r.problem, 140),
           a.technician_id,
           t.full_name,
           pg_catalog.count(*) over ()
      from public.repair_requests r
      left join public.repair_request_assignments a on a.request_id = r.id
      left join public.staff_profiles t on t.user_id = a.technician_id
     where (p_status is null or r.status = p_status)
       and (p_appliance is null or r.appliance = p_appliance)
       and (p_from is null or r.created_at >= p_from)
       and (p_to is null or r.created_at < p_to)
       and (v_mode = 'all'
            or (v_mode = 'none' and a.technician_id is null)
            or (v_mode = 'one' and a.technician_id = v_tech))
       and (v_pattern is null
            or r.name ilike v_pattern escape '\'
            or r.phone like v_pattern escape '\')
     order by case when p_sort = 'oldest' then r.created_at end asc,
              case when p_sort is distinct from 'oldest' then r.created_at end desc,
              r.id
     limit v_limit offset v_offset;
end
$function$;

-- 9. Permissions: authenticated only.
revoke all on function public.admin_list_technicians(boolean) from public, anon, authenticated;
revoke all on function public.admin_get_request_assignment(uuid) from public, anon, authenticated;
revoke all on function public.admin_list_assignment_events(uuid) from public, anon, authenticated;
revoke all on function public.admin_assign_technician(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.admin_list_repair_requests_v2(text, text, text, timestamptz, timestamptz, text, text, integer, integer) from public, anon, authenticated;

grant execute on function public.admin_list_technicians(boolean) to authenticated;
grant execute on function public.admin_get_request_assignment(uuid) to authenticated;
grant execute on function public.admin_list_assignment_events(uuid) to authenticated;
grant execute on function public.admin_assign_technician(uuid, uuid, text) to authenticated;
grant execute on function public.admin_list_repair_requests_v2(text, text, text, timestamptz, timestamptz, text, text, integer, integer) to authenticated;

commit;
