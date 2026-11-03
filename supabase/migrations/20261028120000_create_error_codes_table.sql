
-- Ostadkaran: Appliance Error Codes
-- Review before applying to Supabase.

begin;

create table public.error_codes (
  id uuid primary key default gen_random_uuid(),

  appliance_category text not null
    check (appliance_category in (
      'washing-machine',
      'refrigerator',
      'dishwasher',
      'television',
      'stove',
      'vacuum-cleaner',
      'air-conditioner',
      'other'
    )),

  brand text not null
    check (length(btrim(brand)) > 0),

  model text,

  error_code text not null
    check (length(btrim(error_code)) > 0),

  title text not null
    check (length(btrim(title)) > 0),

  meaning text not null
    check (length(btrim(meaning)) > 0),

  possible_causes text[] not null default '{}',
  safe_steps text[] not null default '{}',

  source_name text,
  source_url text,
  verification_notes text,

  status text not null default 'draft'
    check (status in ('draft', 'review', 'published')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,

  constraint error_codes_brand_code_model_unique
    unique (appliance_category, brand, error_code, model)
);

create index error_codes_public_lookup_idx
  on public.error_codes (appliance_category, brand, error_code)
  where status = 'published';

alter table public.error_codes enable row level security;

revoke all on table public.error_codes from anon, authenticated;
grant select on table public.error_codes to anon, authenticated;

create policy "Anyone can read published error codes"
  on public.error_codes
  for select
  to anon, authenticated
  using (status = 'published');

commit;
