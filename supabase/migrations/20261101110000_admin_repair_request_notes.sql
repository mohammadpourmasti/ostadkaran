-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run.
--
-- PURPOSE
--   Internal notes and status history for repair requests. One append-only table: ordinary notes, call attempts,
--   successful calls and status changes (with old/new status and the reason) live together as one timeline.
--   public.repair_requests itself is NOT altered (no new column, status values untouched).
--
-- PREREQUISITES
--   * 20261101100000_admin_staff_profiles.sql applied.
--   * public.repair_requests exists with: id uuid, created_at timestamptz, name text, phone text, appliance text,
--     problem text, status text, brand text. This migration CHECKS that and stops with a clear error otherwise
--     (for example if id is not uuid).
--
-- PERMISSIONS
--   * anon, authenticated: NO privileges on this table. Rows are written only by the SECURITY DEFINER functions
--     of migration 20261101120000, so panel users can neither edit nor delete history.
--
-- RLS POLICY
--   RLS enabled with NO policies: direct access is denied to every non-owner role.
--
-- HOW TO TEST (read-only, after applying)
--   select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'repair_request_notes';  -- t
--   select count(*) from information_schema.role_table_grants
--     where table_schema = 'public' and table_name = 'repair_request_notes' and grantee in ('anon', 'authenticated');  -- 0
--
-- RISKS
--   * request_id references repair_requests with ON DELETE RESTRICT: a request that has history cannot be
--     deleted until its notes are handled deliberately.
--   * author_id references auth.users with ON DELETE RESTRICT for the same reason.
--
-- ROLLBACK (manual, only if ever needed after applying)
--   drop table public.repair_request_notes;

begin;

-- 1. Refuse to continue if the base table does not look as expected.
do $$
declare
  v_matching integer;
begin
  if to_regclass('public.repair_requests') is null then
    raise exception 'public.repair_requests does not exist. Aborting without changes.';
  end if;

  select count(*)
    into v_matching
    from information_schema.columns
   where table_schema = 'public'
     and table_name = 'repair_requests'
     and (column_name, data_type) in (
       ('id', 'uuid'),
       ('created_at', 'timestamp with time zone'),
       ('name', 'text'),
       ('phone', 'text'),
       ('appliance', 'text'),
       ('problem', 'text'),
       ('status', 'text'),
       ('brand', 'text')
     );

  if v_matching <> 8 then
    raise exception
      'public.repair_requests does not have the expected columns (id uuid, created_at timestamptz, name/phone/appliance/problem/status/brand text). Review the dashboard migrations before applying. Aborting without changes.';
  end if;

  if to_regclass('public.staff_profiles') is null then
    raise exception 'public.staff_profiles is missing. Apply 20261101100000_admin_staff_profiles.sql first.';
  end if;

  if to_regclass('public.repair_request_notes') is not null then
    select count(*)
      into v_matching
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'repair_request_notes'
       and (column_name, data_type) in (
         ('id', 'uuid'),
         ('request_id', 'uuid'),
         ('author_id', 'uuid'),
         ('kind', 'text'),
         ('body', 'text'),
         ('old_status', 'text'),
         ('new_status', 'text'),
         ('created_at', 'timestamp with time zone')
       );

    if v_matching <> 8 then
      raise exception
        'public.repair_request_notes already exists but does not have the expected columns. Aborting without changes.';
    end if;
  end if;
end
$$;

-- 2. Table.
create table if not exists public.repair_request_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.repair_requests (id) on delete restrict,
  author_id uuid not null references auth.users (id) on delete restrict,
  kind text not null
    check (kind in ('note', 'call_attempt', 'call_success', 'status_change')),
  body text
    check (body is null or char_length(btrim(body)) between 1 and 1000),
  old_status text
    check (old_status is null or old_status in ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  new_status text
    check (new_status is null or new_status in ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint repair_request_notes_shape check (
    (kind = 'status_change' and old_status is not null and new_status is not null)
    or (kind <> 'status_change' and body is not null and old_status is null and new_status is null)
  )
);

create index if not exists repair_request_notes_request_idx
  on public.repair_request_notes (request_id, created_at desc);

create index if not exists repair_request_notes_created_idx
  on public.repair_request_notes (created_at desc);

-- 3. Locked down: only the SECURITY DEFINER functions touch it.
alter table public.repair_request_notes enable row level security;
revoke all on table public.repair_request_notes from anon, authenticated;

commit;
