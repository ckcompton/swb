-- Boxing Gym Platform: core schema
-- Enums, tables, constraints, indexes, updated_at triggers.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('admin', 'member');
create type public.membership_status as enum ('active', 'inactive', 'expired');
create type public.booking_status as enum ('booked', 'canceled');
create type public.class_session_status as enum ('scheduled', 'canceled');

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'member',
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- trainers
-- ---------------------------------------------------------------------------

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  bio text,
  photo_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trainers_is_active_idx on public.trainers (is_active);

create trigger trainers_set_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- class_sessions
-- ---------------------------------------------------------------------------

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  trainer_id uuid references public.trainers (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  status public.class_session_status not null default 'scheduled',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sessions_end_after_start check (ends_at > starts_at)
);

create index class_sessions_starts_at_idx on public.class_sessions (starts_at);
create index class_sessions_trainer_id_idx on public.class_sessions (trainer_id);
create index class_sessions_status_idx on public.class_sessions (status);

create trigger class_sessions_set_updated_at
  before update on public.class_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_name text not null check (char_length(trim(plan_name)) > 0),
  status public.membership_status not null default 'inactive',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_end_after_start check (ends_at is null or ends_at > starts_at)
);

create index memberships_profile_id_idx on public.memberships (profile_id);
create index memberships_status_idx on public.memberships (status);

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.booking_status not null default 'booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_class_session_id_idx on public.bookings (class_session_id);
create index bookings_profile_id_idx on public.bookings (profile_id);

-- Prevent duplicate ACTIVE bookings for the same member + class session.
-- Canceled bookings are excluded so a member can re-book after canceling.
create unique index bookings_unique_active_booking
  on public.bookings (class_session_id, profile_id)
  where (status = 'booked');

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- announcements
-- ---------------------------------------------------------------------------

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  body text not null check (char_length(trim(body)) > 0),
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_is_published_idx on public.announcements (is_published);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();
