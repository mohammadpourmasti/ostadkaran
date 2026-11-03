-- DRAFT FOR REVIEW - NOT APPLIED. Transactional; safe to re-run. OPTIONAL: only needed once an SMS provider is connected.
--
-- PURPOSE
--   Outbox for the future SMS layer (lib/sms). One row per message ATTEMPT group: delivery status, provider error
--   code, timestamps, and a unique idempotency key so the same event is never sent twice.
--   The table deliberately has NO column for the message text, links, codes or the full phone number:
--   it stores a template name, the recipient's user id and a masked number only.
--
-- PREREQUISITES
--   * 20261101100000 applied (staff_profiles). Nothing in the dashboard writes here while SMS is disabled.
--
-- PERMISSIONS
--   RLS enabled, no policies, all privileges revoked from anon/authenticated. The server writes with the secret
--   key (service role bypasses RLS) from lib/sms only.
--
-- HOW TO TEST (read-only)
--   select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'sms_outbox';            -- t
--   select count(*) from information_schema.role_table_grants where table_schema = 'public'
--     and table_name = 'sms_outbox' and grantee in ('anon', 'authenticated');                              -- 0
--
-- RISKS
--   * Retention: rows hold masked numbers only, but delete old rows periodically if the table grows.
--
-- ROLLBACK (manual)
--   drop table public.sms_outbox;

begin;

do $$
declare
  v_matching integer;
begin
  if to_regclass('public.staff_profiles') is null then
    raise exception 'Apply 20261101100000 first. Aborting without changes.';
  end if;

  if to_regclass('public.sms_outbox') is not null then
    select count(*) into v_matching
      from information_schema.columns
     where table_schema = 'public' and table_name = 'sms_outbox'
       and (column_name, data_type) in (('id', 'uuid'), ('idempotency_key', 'text'), ('template', 'text'),
                                        ('recipient_user_id', 'uuid'), ('recipient_masked', 'text'),
                                        ('provider', 'text'), ('status', 'text'), ('provider_message_id', 'text'),
                                        ('error_code', 'text'), ('attempts', 'integer'),
                                        ('created_at', 'timestamp with time zone'),
                                        ('sent_at', 'timestamp with time zone'),
                                        ('updated_at', 'timestamp with time zone'));
    if v_matching <> 13 then
      raise exception 'public.sms_outbox already exists with an unexpected shape. Aborting without changes.';
    end if;
  end if;
end
$$;

create table if not exists public.sms_outbox (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 8 and 200),
  template text not null check (template ~ '^[a-z][a-z_]{0,59}$'),
  recipient_user_id uuid references public.staff_profiles (user_id) on delete set null,
  recipient_masked text check (recipient_masked is null or char_length(recipient_masked) <= 20),
  provider text not null check (provider ~ '^[a-z][a-z0-9_-]{0,39}$'),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider_message_id text check (provider_message_id is null or char_length(provider_message_id) <= 100),
  error_code text check (error_code is null or char_length(error_code) <= 60),
  attempts integer not null default 0 check (attempts >= 0),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists sms_outbox_status_idx on public.sms_outbox (status, created_at desc);
create index if not exists sms_outbox_recipient_idx on public.sms_outbox (recipient_user_id, created_at desc);

alter table public.sms_outbox enable row level security;
revoke all on table public.sms_outbox from anon, authenticated;

commit;
