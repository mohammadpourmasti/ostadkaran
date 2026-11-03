-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run (CREATE OR REPLACE).
--
-- PURPOSE
--   Read-only reporting for /admin/reports, filtered by date range, technician, request status and appliance.
--   Replaces the earlier two-argument report draft (it is dropped below if it was ever applied).
--   Nothing is altered: public.repair_requests, the notes table and the assignment tables are only READ.
--
-- DEFINITIONS (the same text is shown on the report page)
--   * Request set      = requests CREATED inside [from, to) (Asia/Tehran days) that match the status, appliance and
--                        technician filters.
--   * Technician       = the CURRENT responsible technician (repair_request_assignments). A closed request's
--                        technician cannot be changed (see 20261101140000), so completed/cancelled results stay with
--                        the technician who handled them. Open requests count for whoever holds them now.
--   * Active           = status new, contacted or in_progress.
--   * Completion rate  = completed / all requests of that technician in the set (NULL when the total is 0).
--                        Cancelled requests are never counted as completed.
--   * Unassigned       = requests in the set with no technician; always shown separately.
--   * assignments_made = history events (repair_request_assignment_events) in the period whose NEW technician is
--                        that person. It is HISTORY of assignment actions, independent of who holds the request now,
--                        and ignores the status/appliance filters.
--   * Response times   = creation -> first move out of 'new' / creation -> completed, from the status history
--                        written by the dashboard; requests without such history are not part of the average.
--
-- PREREQUISITES
--   * 20261101100000 .. 20261101140000 applied (this one reads the assignment tables).
--
-- PERMISSIONS
--   SECURITY DEFINER, empty search_path, active manager/operator only (else 'not_authorized' 42501).
--   EXECUTE for 'authenticated' only. The CSV export function returns NO customer name, phone or problem text.
--
-- RLS POLICY
--   None changed.
--
-- HOW TO TEST (read-only)
--   select has_function_privilege('anon', 'public.admin_repair_request_report(timestamptz, timestamptz, text, text, text)', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.admin_repair_request_report(timestamptz, timestamptz, text, text, text)', 'execute'); -- true
--   Then open /admin/reports while signed in as staff.
--
-- RISKS
--   * Ranges over 366 days are rejected ('invalid_range'). The CSV export is capped at 10000 rows.
--
-- ROLLBACK (manual, only if ever needed after applying)
--   drop function public.admin_repair_request_report(timestamptz, timestamptz, text, text, text);
--   drop function public.admin_report_export_rows(timestamptz, timestamptz, text, text, text);

begin;

do $$
begin
  if to_regclass('public.repair_request_assignments') is null
     or to_regclass('public.repair_request_assignment_events') is null
     or to_regclass('public.repair_request_notes') is null
     or to_regprocedure('public.admin_require_staff()') is null then
    raise exception 'Apply 20261101100000 .. 20261101140000 first. Aborting without changes.';
  end if;
end
$$;

-- The earlier draft had only (from, to); remove it if it exists so there is a single report function.
drop function if exists public.admin_repair_request_report(timestamptz, timestamptz);

create or replace function public.admin_repair_request_report(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_technician text default null,
  p_status text default null,
  p_appliance text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_from timestamptz := coalesce(p_from, pg_catalog.now() - interval '30 days');
  v_to timestamptz := coalesce(p_to, pg_catalog.now());
  v_bucket text;
  v_mode text;
  v_tech uuid;
  v_result jsonb;
begin
  perform public.admin_require_staff();

  if v_to <= v_from or v_to - v_from > interval '366 days' then
    raise exception 'invalid_range' using errcode = '22023';
  end if;
  if p_status is not null and p_status not in ('new', 'contacted', 'in_progress', 'completed', 'cancelled') then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;
  if p_appliance is not null and p_appliance !~ '^[a-z][a-z-]{0,39}$' then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;

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

  v_bucket := case when v_to - v_from <= interval '92 days' then 'day' else 'month' end;

  with base as materialized (
    select r.id, r.created_at, r.status, r.appliance, r.brand, a.technician_id
      from public.repair_requests r
      left join public.repair_request_assignments a on a.request_id = r.id
     where r.created_at >= v_from and r.created_at < v_to
       and (p_status is null or r.status = p_status)
       and (p_appliance is null or r.appliance = p_appliance)
       and (v_mode = 'all'
            or (v_mode = 'none' and a.technician_id is null)
            or (v_mode = 'one' and a.technician_id = v_tech))
  ),
  series as (
    select g.day, coalesce(c.n, 0) as n
      from (
        select gs.d::date as day
          from pg_catalog.generate_series(
                 pg_catalog.date_trunc(v_bucket, v_from at time zone 'Asia/Tehran'),
                 (v_to - interval '1 microsecond') at time zone 'Asia/Tehran',
                 ('1 ' || v_bucket)::interval) as gs(d)
      ) g
      left join (
        select pg_catalog.date_trunc(v_bucket, b.created_at at time zone 'Asia/Tehran')::date as day,
               pg_catalog.count(*) as n
          from base b
         group by 1
      ) c on c.day = g.day
  ),
  by_status as (
    select b.status, pg_catalog.count(*) as c from base b group by b.status
  ),
  by_appliance as (
    select b.appliance as key, pg_catalog.count(*) as c from base b group by b.appliance
  ),
  by_brand as (
    select pg_catalog.btrim(b.brand) as key, pg_catalog.count(*) as c
      from base b
     where b.brand is not null and pg_catalog.btrim(b.brand) <> ''
     group by pg_catalog.btrim(b.brand)
     order by c desc, key
     limit 8
  ),
  techs as (
    select sp.user_id,
           sp.full_name,
           sp.is_active,
           pg_catalog.count(b.id) as total,
           pg_catalog.count(b.id) filter (where b.status = 'new') as c_new,
           pg_catalog.count(b.id) filter (where b.status = 'contacted') as c_contacted,
           pg_catalog.count(b.id) filter (where b.status = 'in_progress') as c_in_progress,
           pg_catalog.count(b.id) filter (where b.status = 'completed') as c_completed,
           pg_catalog.count(b.id) filter (where b.status = 'cancelled') as c_cancelled,
           (select pg_catalog.count(*)
              from public.repair_request_assignment_events e
             where e.to_technician_id = sp.user_id
               and e.created_at >= v_from and e.created_at < v_to) as made
      from public.staff_profiles sp
      left join base b on b.technician_id = sp.user_id
     where sp.role = 'technician'
       and (v_mode <> 'one' or sp.user_id = v_tech)
       and (v_mode <> 'none')
     group by sp.user_id, sp.full_name, sp.is_active
  ),
  first_contact as (
    select (extract(epoch from (pg_catalog.min(n.created_at) - b.created_at)) / 3600.0)::double precision as h
      from base b
      join public.repair_request_notes n
        on n.request_id = b.id and n.kind = 'status_change' and n.old_status = 'new'
     group by b.id, b.created_at
  ),
  done as (
    select (extract(epoch from (pg_catalog.min(n.created_at) - b.created_at)) / 3600.0)::double precision as h
      from base b
      join public.repair_request_notes n
        on n.request_id = b.id and n.kind = 'status_change' and n.new_status = 'completed'
     group by b.id, b.created_at
  ),
  recent_events as (
    select e.id, e.created_at, e.request_id, r.name as customer_name,
           e.from_technician_id, f.full_name as from_name,
           e.to_technician_id, t.full_name as to_name,
           a.full_name as actor_name, e.note
      from public.repair_request_assignment_events e
      join public.repair_requests r on r.id = e.request_id
      left join public.staff_profiles f on f.user_id = e.from_technician_id
      left join public.staff_profiles t on t.user_id = e.to_technician_id
      left join public.staff_profiles a on a.user_id = e.actor_id
     where e.created_at >= v_from and e.created_at < v_to
       and (v_mode <> 'one' or e.from_technician_id = v_tech or e.to_technician_id = v_tech)
     order by e.created_at desc, e.id
     limit 15
  )
  select pg_catalog.jsonb_build_object(
    'total', (select pg_catalog.count(*) from base),
    'assigned', (select pg_catalog.count(*) from base where technician_id is not null),
    'unassigned', (select pg_catalog.count(*) from base where technician_id is null),
    'by_status', (select coalesce(pg_catalog.jsonb_object_agg(s.status, s.c), '{}'::jsonb) from by_status s),
    'bucket', v_bucket,
    'series', (select coalesce(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object('day', s.day::text, 'count', s.n) order by s.day), '[]'::jsonb) from series s),
    'appliances', (select coalesce(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object('key', x.key, 'count', x.c) order by x.c desc, x.key), '[]'::jsonb) from by_appliance x),
    'brands', (select coalesce(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object('key', x.key, 'count', x.c) order by x.c desc, x.key), '[]'::jsonb) from by_brand x),
    'technicians', (select coalesce(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'id', t.user_id, 'name', t.full_name, 'is_active', t.is_active,
                   'total', t.total, 'new', t.c_new, 'contacted', t.c_contacted, 'in_progress', t.c_in_progress,
                   'completed', t.c_completed, 'cancelled', t.c_cancelled,
                   'active', t.c_new + t.c_contacted + t.c_in_progress,
                   'assignments_made', t.made)
                 order by t.total desc, t.full_name, t.user_id), '[]'::jsonb) from techs t),
    'first_contact', (select pg_catalog.jsonb_build_object(
                 'count', pg_catalog.count(*), 'avg_hours', pg_catalog.avg(h),
                 'median_hours', pg_catalog.percentile_cont(0.5) within group (order by h)) from first_contact),
    'completion', (select pg_catalog.jsonb_build_object(
                 'count', pg_catalog.count(*), 'avg_hours', pg_catalog.avg(h),
                 'median_hours', pg_catalog.percentile_cont(0.5) within group (order by h)) from done),
    'events', (select coalesce(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'id', ev.id, 'created_at', ev.created_at, 'request_id', ev.request_id, 'customer_name', ev.customer_name,
                   'from_id', ev.from_technician_id, 'from_name', ev.from_name,
                   'to_id', ev.to_technician_id, 'to_name', ev.to_name,
                   'actor_name', ev.actor_name, 'note', ev.note)
                 order by ev.created_at desc, ev.id), '[]'::jsonb) from recent_events ev)
  )
  into v_result;

  return v_result;
end
$function$;

-- CSV export rows: NO customer name, phone or problem text. Capped at 10000 rows.
create or replace function public.admin_report_export_rows(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_technician text default null,
  p_status text default null,
  p_appliance text default null
)
returns table (
  created_at timestamptz,
  appliance text,
  brand text,
  status text,
  technician_name text,
  assigned_at timestamptz
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_from timestamptz := coalesce(p_from, pg_catalog.now() - interval '30 days');
  v_to timestamptz := coalesce(p_to, pg_catalog.now());
  v_mode text;
  v_tech uuid;
begin
  perform public.admin_require_staff();

  if v_to <= v_from or v_to - v_from > interval '366 days' then
    raise exception 'invalid_range' using errcode = '22023';
  end if;
  if p_status is not null and p_status not in ('new', 'contacted', 'in_progress', 'completed', 'cancelled') then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;
  if p_appliance is not null and p_appliance !~ '^[a-z][a-z-]{0,39}$' then
    raise exception 'invalid_filter' using errcode = '22023';
  end if;

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

  return query
    select r.created_at, r.appliance, r.brand, r.status, t.full_name, a.assigned_at
      from public.repair_requests r
      left join public.repair_request_assignments a on a.request_id = r.id
      left join public.staff_profiles t on t.user_id = a.technician_id
     where r.created_at >= v_from and r.created_at < v_to
       and (p_status is null or r.status = p_status)
       and (p_appliance is null or r.appliance = p_appliance)
       and (v_mode = 'all'
            or (v_mode = 'none' and a.technician_id is null)
            or (v_mode = 'one' and a.technician_id = v_tech))
     order by r.created_at desc, r.id
     limit 10000;
end
$function$;

revoke all on function public.admin_repair_request_report(timestamptz, timestamptz, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_report_export_rows(timestamptz, timestamptz, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_repair_request_report(timestamptz, timestamptz, text, text, text) to authenticated;
grant execute on function public.admin_report_export_rows(timestamptz, timestamptz, text, text, text) to authenticated;

commit;
