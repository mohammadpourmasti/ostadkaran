-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run (CREATE OR REPLACE).
--
-- PURPOSE
--   The only database surface the admin dashboard uses. Every function:
--     * is SECURITY DEFINER with an empty search_path (fully qualified names only),
--     * first checks that auth.uid() belongs to an ACTIVE staff profile with role manager or operator
--       (otherwise it raises 'not_authorized', SQLSTATE 42501),
--     * is executable by 'authenticated' only (never anon, never public).
--   The dashboard therefore reads customer data with the signed-in user's own session; the service_role key is
--   not used by the panel. public.repair_requests is not altered and gets no new grants or policies.
--
--   Status changes are enforced HERE, not only in the UI:
--     manager:  any status -> any other valid status.
--     operator: new -> contacted, new -> cancelled, contacted -> cancelled only.
--     cancelling requires a reason (>= 3 characters).
--   The status update and its history row are written by one function = one transaction: if the history insert
--   fails, the status change is rolled back. The caller passes the status it last saw; if the row changed in the
--   meantime the call fails with 'stale_status' instead of overwriting someone else's work.
--
-- PREREQUISITES
--   * 20261101100000_admin_staff_profiles.sql and 20261101110000_admin_repair_request_notes.sql applied.
--
-- PERMISSIONS
--   REVOKE ALL FROM public, anon, authenticated; GRANT EXECUTE TO authenticated on each admin_* function.
--   The internal helper admin_require_staff() is not granted to anyone (called only from the others).
--
-- RLS POLICY
--   No table policy changes. Row access is decided inside the functions (staff role check) because the tables
--   stay closed to anon/authenticated.
--
-- HOW TO TEST
--   1. Read-only: select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--        where n.nspname = 'public' and proname like 'admin\_%';
--   2. Read-only: select has_function_privilege('anon', 'public.admin_repair_request_stats()', 'execute');   -- false
--   3. With a signed-in NON-staff user the calls must fail with not_authorized.
--   4. Use a throw-away test project (not production) to try add-note and change-status end to end.
--
-- RISKS
--   * CREATE OR REPLACE refuses to change an existing function's return type: if a function with the same name
--     but a different shape already exists, the migration stops with Postgres' own error.
--   * Search uses ILIKE on name/phone; fine for the expected volume, add an index if the table grows large.
--
-- ROLLBACK (manual, only if ever needed after applying)
--   drop function public.admin_change_request_status(uuid, text, text, text);
--   drop function public.admin_add_request_note(uuid, text, text);
--   drop function public.admin_recent_activity(integer);
--   drop function public.admin_repair_request_stats();
--   drop function public.admin_list_request_notes(uuid);
--   drop function public.admin_get_repair_request(uuid);
--   drop function public.admin_list_repair_requests(text, text, text, timestamptz, timestamptz, text, integer, integer);
--   drop function public.admin_require_staff();

begin;

do $$
begin
  if to_regclass('public.staff_profiles') is null or to_regclass('public.repair_request_notes') is null then
    raise exception 'Apply 20261101100000 and 20261101110000 first. Aborting without changes.';
  end if;
end
$$;

-- Internal guard: returns the caller's staff role or raises not_authorized.
create or replace function public.admin_require_staff()
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_role text;
begin
  select sp.role
    into v_role
    from public.staff_profiles sp
   where sp.user_id = (select auth.uid())
     and sp.is_active
     and sp.role in ('manager', 'operator');

  if v_role is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  return v_role;
end
$function$;

-- Paged, filtered list.
create or replace function public.admin_list_repair_requests(
  p_search text default null,
  p_status text default null,
  p_appliance text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
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
begin
  perform public.admin_require_staff();

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
           pg_catalog.count(*) over ()
      from public.repair_requests r
     where (p_status is null or r.status = p_status)
       and (p_appliance is null or r.appliance = p_appliance)
       and (p_from is null or r.created_at >= p_from)
       and (p_to is null or r.created_at < p_to)
       and (v_pattern is null
            or r.name ilike v_pattern escape '\'
            or r.phone like v_pattern escape '\')
     order by case when p_sort = 'oldest' then r.created_at end asc,
              case when p_sort is distinct from 'oldest' then r.created_at end desc,
              r.id
     limit v_limit offset v_offset;
end
$function$;

-- One request.
create or replace function public.admin_get_repair_request(p_id uuid)
returns table (
  id uuid,
  created_at timestamptz,
  name text,
  phone text,
  appliance text,
  brand text,
  problem text,
  status text
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select r.id, r.created_at, r.name, r.phone, r.appliance, r.brand, r.problem, r.status
      from public.repair_requests r
     where r.id = p_id;
end
$function$;

-- Timeline of one request (newest first).
create or replace function public.admin_list_request_notes(p_request_id uuid)
returns table (
  id uuid,
  created_at timestamptz,
  kind text,
  body text,
  old_status text,
  new_status text,
  author_name text
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select n.id, n.created_at, n.kind, n.body, n.old_status, n.new_status, sp.full_name
      from public.repair_request_notes n
      left join public.staff_profiles sp on sp.user_id = n.author_id
     where n.request_id = p_request_id
     order by n.created_at desc, n.id;
end
$function$;

-- Dashboard numbers: totals per status, last 14 days (Asia/Tehran days) and "new for more than a day".
create or replace function public.admin_repair_request_stats()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_total bigint;
  v_by_status jsonb;
  v_daily jsonb;
  v_stale bigint;
  v_today date := (pg_catalog.now() at time zone 'Asia/Tehran')::date;
begin
  perform public.admin_require_staff();

  select pg_catalog.count(*) into v_total from public.repair_requests;

  select coalesce(pg_catalog.jsonb_object_agg(s.status, s.c), '{}'::jsonb)
    into v_by_status
    from (
      select r.status, pg_catalog.count(*) as c
        from public.repair_requests r
       group by r.status
    ) s;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object('day', d.day::text, 'count', coalesce(c.n, 0))
           order by d.day)
    into v_daily
    from pg_catalog.generate_series(v_today - 13, v_today, interval '1 day') as d(day)
    left join (
      select (r.created_at at time zone 'Asia/Tehran')::date as day, pg_catalog.count(*) as n
        from public.repair_requests r
       where r.created_at >= pg_catalog.now() - interval '15 days'
       group by 1
    ) c on c.day = d.day::date;

  select pg_catalog.count(*)
    into v_stale
    from public.repair_requests r
   where r.status = 'new'
     and r.created_at < pg_catalog.now() - interval '1 day';

  return pg_catalog.jsonb_build_object(
    'total', v_total,
    'by_status', v_by_status,
    'daily', coalesce(v_daily, '[]'::jsonb),
    'stale_new', v_stale
  );
end
$function$;

-- Latest timeline entries across all requests.
create or replace function public.admin_recent_activity(p_limit integer default 8)
returns table (
  id uuid,
  created_at timestamptz,
  request_id uuid,
  customer_name text,
  kind text,
  body text,
  old_status text,
  new_status text,
  author_name text
)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform public.admin_require_staff();

  return query
    select n.id, n.created_at, n.request_id, r.name, n.kind, n.body, n.old_status, n.new_status, sp.full_name
      from public.repair_request_notes n
      join public.repair_requests r on r.id = n.request_id
      left join public.staff_profiles sp on sp.user_id = n.author_id
     order by n.created_at desc, n.id
     limit least(greatest(coalesce(p_limit, 8), 1), 50);
end
$function$;

-- Append a note / call attempt / successful call. Returns the new note id.
create or replace function public.admin_add_request_note(
  p_request_id uuid,
  p_kind text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_body text := pg_catalog.btrim(coalesce(p_body, ''));
  v_id uuid;
begin
  perform public.admin_require_staff();

  if p_kind is null or p_kind not in ('note', 'call_attempt', 'call_success') then
    raise exception 'invalid_kind' using errcode = '22023';
  end if;

  if pg_catalog.char_length(v_body) < 1 or pg_catalog.char_length(v_body) > 1000 then
    raise exception 'invalid_body' using errcode = '22023';
  end if;

  if not exists (select 1 from public.repair_requests r where r.id = p_request_id) then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  insert into public.repair_request_notes (request_id, author_id, kind, body)
  values (p_request_id, (select auth.uid()), p_kind, v_body)
  returning id into v_id;

  return v_id;
end
$function$;

-- Change status + write history atomically. Returns the new status.
create or replace function public.admin_change_request_status(
  p_request_id uuid,
  p_expected_status text,
  p_new_status text,
  p_reason text default null
)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_role text;
  v_current text;
  v_reason text := nullif(pg_catalog.btrim(coalesce(p_reason, '')), '');
begin
  v_role := public.admin_require_staff();

  if p_new_status is null
     or p_new_status not in ('new', 'contacted', 'in_progress', 'completed', 'cancelled') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;

  if v_reason is not null and pg_catalog.char_length(v_reason) > 1000 then
    raise exception 'invalid_reason' using errcode = '22023';
  end if;

  -- Lock the row so two people cannot change the same request at once.
  select r.status
    into v_current
    from public.repair_requests r
   where r.id = p_request_id
   for update;

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if v_current is distinct from p_expected_status then
    raise exception 'stale_status' using errcode = '40001';
  end if;

  if p_new_status = v_current then
    raise exception 'status_unchanged' using errcode = '22023';
  end if;

  if v_role = 'operator'
     and not ((v_current = 'new' and p_new_status in ('contacted', 'cancelled'))
              or (v_current = 'contacted' and p_new_status = 'cancelled')) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  if p_new_status = 'cancelled' and (v_reason is null or pg_catalog.char_length(v_reason) < 3) then
    raise exception 'reason_required' using errcode = '22023';
  end if;

  update public.repair_requests
     set status = p_new_status
   where id = p_request_id;

  insert into public.repair_request_notes (request_id, author_id, kind, body, old_status, new_status)
  values (p_request_id, (select auth.uid()), 'status_change', v_reason, v_current, p_new_status);

  return p_new_status;
end
$function$;

-- Permissions: authenticated only; the helper is not exposed at all.
revoke all on function public.admin_require_staff() from public, anon, authenticated;

revoke all on function public.admin_list_repair_requests(text, text, text, timestamptz, timestamptz, text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_get_repair_request(uuid) from public, anon, authenticated;
revoke all on function public.admin_list_request_notes(uuid) from public, anon, authenticated;
revoke all on function public.admin_repair_request_stats() from public, anon, authenticated;
revoke all on function public.admin_recent_activity(integer) from public, anon, authenticated;
revoke all on function public.admin_add_request_note(uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_change_request_status(uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.admin_list_repair_requests(text, text, text, timestamptz, timestamptz, text, integer, integer) to authenticated;
grant execute on function public.admin_get_repair_request(uuid) to authenticated;
grant execute on function public.admin_list_request_notes(uuid) to authenticated;
grant execute on function public.admin_repair_request_stats() to authenticated;
grant execute on function public.admin_recent_activity(integer) to authenticated;
grant execute on function public.admin_add_request_note(uuid, text, text) to authenticated;
grant execute on function public.admin_change_request_status(uuid, text, text, text) to authenticated;

commit;
