# Admin dashboard: Supabase setup (nothing here has been run)

The dashboard code lives under `app/admin`. It needs three migrations and one first account. None of this was
applied by the assistant; review each file, then apply them yourself (Supabase SQL editor or `supabase db push`),
preferably on a test project first.

## Order

1. `20261101100000_admin_staff_profiles.sql` - staff profiles (manager / operator / technician).
2. `20261101110000_admin_repair_request_notes.sql` - append-only notes and status history.
3. `20261101120000_admin_repair_request_functions.sql` - the only functions the panel calls
   (role check, filtered list, stats, notes, atomic status change).

4. `20261101140000_admin_technician_assignments.sql` - technician assignment (current assignment + history) and the
   request list with a technician filter.
5. `20261101150000_admin_repair_request_report.sql` - filtered reports and the CSV export rows (needs 1-4).

6. `20261101160000_admin_technician_profiles.sql` - technician management from the dashboard (phone, specialties,
   activate/deactivate) and the specialty-aware technician picker. Needs 1-5.
7. `20261101170000_sms_outbox.sql` - OPTIONAL. Delivery log for the future SMS layer; nothing writes to it while SMS is off.

Each migration stops with an explicit error if an existing object has a different shape (for example if
`repair_requests.id` is not `uuid`), and each can be re-run.

## First manager account

1. Supabase Dashboard -> Authentication -> Users -> "Add user" (email + password, auto-confirm).
   Public sign-up must stay disabled (Authentication -> Providers/Settings).
2. Copy the new user's UUID, then run once in the SQL editor (replace the placeholders):

```sql
insert into public.staff_profiles (user_id, full_name, role, is_active)
values ('<USER-UUID>', '<full name>', 'manager', true);
```

An Auth user WITHOUT a row here, with `is_active = false`, or with role `technician`, is refused by the dashboard.

## Environment (.env.local - never commit)

```
NEXT_PUBLIC_SUPABASE_URL=...                    # already used by the site
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...        # NEW: publishable (anon) key, safe for the browser
SUPABASE_SECRET_KEY=...                         # already used by the repair form; the dashboard does NOT use it
```

## New dependency

`npm install @supabase/ssr` (session cookies for the server). It was not installed by the assistant.

## Quick checks after applying (read-only)

```sql
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and proname like 'admin\_%';

select has_function_privilege('anon', 'public.admin_repair_request_stats()', 'execute');          -- false
select has_function_privilege('authenticated', 'public.admin_repair_request_stats()', 'execute'); -- true

select count(*) from information_schema.role_table_grants
 where table_schema = 'public' and table_name = 'repair_request_notes' and grantee in ('anon', 'authenticated'); -- 0
```

## Technician accounts

Managers create technicians in the dashboard (`/admin/staff`). The server creates the Auth account with the Auth Admin
API (secret key, server only) and the profile through `admin_create_technician`; if the profile step fails the Auth
account is deleted again. This needs `SUPABASE_SECRET_KEY` in `.env.local`, and public sign-up must stay disabled.
Technicians can still be created by hand (below); such rows work everywhere and can be completed from the staff page.

A technician is a normal Supabase Auth user plus a staff profile with role `technician`. Technicians are only
*assignable* in version 1: they cannot sign in to the dashboard and the database refuses every `admin_*` call from them.

```sql
insert into public.staff_profiles (user_id, full_name, role, is_active)
values ('<TECHNICIAN-USER-UUID>', '<full name>', 'technician', true);
```

To retire a technician set `is_active = false` (do not delete: assignments and history reference the profile).
Only active technicians appear in the assignment picker; inactive ones still show in reports and filters.

## Assignment rules (enforced by the database)

- manager: assign, change and remove. operator: assign and change (cannot remove). technician: nothing.
- a completed or cancelled request is closed: its technician can no longer be changed.
- every change writes a history row (previous technician, new technician, who, when, optional note).
