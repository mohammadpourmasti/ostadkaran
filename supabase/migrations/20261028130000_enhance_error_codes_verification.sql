
-- Add model reference and verification level to error codes.
-- Review before applying to Supabase.

begin;

alter table public.error_codes
  add column model_reference text,
  add column verification_level text not null default 'unverified'
    check (
      verification_level in (
        'unverified',
        'partially_verified',
        'verified'
      )
    );

comment on column public.error_codes.model_reference is
  'Model or model series used to verify this error-code interpretation.';

comment on column public.error_codes.verification_level is
  'Evidence level: unverified, partially_verified, or verified.';

commit;
