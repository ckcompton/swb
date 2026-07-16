-- Free trial class requests: prospective members request a trial class
-- without creating an account or a booking. Admins triage requests.

-- ---------------------------------------------------------------------------
-- class_sessions: opt-in flag for which sessions accept trial requests
-- ---------------------------------------------------------------------------

alter table public.class_sessions
  add column allows_free_trial boolean not null default false;

-- ---------------------------------------------------------------------------
-- trial_requests
-- ---------------------------------------------------------------------------

create type public.trial_request_status as enum (
  'pending',
  'contacted',
  'approved',
  'declined',
  'completed'
);

create type public.trial_experience_level as enum (
  'none',
  'beginner',
  'intermediate',
  'advanced'
);

create table public.trial_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(trim(first_name)) > 0),
  last_name text not null check (char_length(trim(last_name)) > 0),
  email text not null check (char_length(trim(email)) > 0),
  phone text not null check (char_length(trim(phone)) > 0),
  class_session_id uuid not null references public.class_sessions (id) on delete cascade,
  experience_level public.trial_experience_level not null,
  message text,
  status public.trial_request_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trial_requests_class_session_id_idx on public.trial_requests (class_session_id);
create index trial_requests_status_idx on public.trial_requests (status);
-- Supports the abuse-prevention lookup: "has this email already requested
-- this class recently?" (see createTrialRequest in packages/data-access).
create index trial_requests_email_class_created_idx
  on public.trial_requests (email, class_session_id, created_at);

create trigger trial_requests_set_updated_at
  before update on public.trial_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- Public (anon + authenticated) may INSERT only - no read/update/delete.
-- Admins may select/update/delete. There is intentionally no "own row"
-- select policy: trial requests are not tied to an auth account, so a
-- submitter cannot read their own request back.
-- ---------------------------------------------------------------------------

alter table public.trial_requests enable row level security;

create policy "trial_requests_insert_public"
  on public.trial_requests for insert
  to anon, authenticated
  with check (true);

create policy "trial_requests_select_admin"
  on public.trial_requests for select
  to authenticated
  using (public.is_admin());

create policy "trial_requests_update_admin"
  on public.trial_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "trial_requests_delete_admin"
  on public.trial_requests for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant insert on public.trial_requests to anon, authenticated;
grant select, update, delete on public.trial_requests to authenticated;
