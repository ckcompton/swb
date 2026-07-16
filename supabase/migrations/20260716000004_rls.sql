-- Row Level Security: enable on every table and define explicit policies.

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin? SECURITY DEFINER avoids recursive
-- RLS evaluation when policies on `profiles` need to check role.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'member');

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No direct insert policy: profile rows are created by the
-- handle_new_user() trigger (SECURITY DEFINER) on signup.

-- ---------------------------------------------------------------------------
-- trainers
-- ---------------------------------------------------------------------------

alter table public.trainers enable row level security;

create policy "trainers_select_active_or_admin"
  on public.trainers for select
  to authenticated, anon
  using (is_active or public.is_admin());

create policy "trainers_insert_admin"
  on public.trainers for insert
  to authenticated
  with check (public.is_admin());

create policy "trainers_update_admin"
  on public.trainers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "trainers_delete_admin"
  on public.trainers for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- class_sessions
-- ---------------------------------------------------------------------------

alter table public.class_sessions enable row level security;

create policy "class_sessions_select_all"
  on public.class_sessions for select
  to authenticated, anon
  using (true);

create policy "class_sessions_insert_admin"
  on public.class_sessions for insert
  to authenticated
  with check (public.is_admin());

create policy "class_sessions_update_admin"
  on public.class_sessions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "class_sessions_delete_admin"
  on public.class_sessions for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------

alter table public.memberships enable row level security;

create policy "memberships_select_own_or_admin"
  on public.memberships for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "memberships_insert_admin"
  on public.memberships for insert
  to authenticated
  with check (public.is_admin());

create policy "memberships_update_admin"
  on public.memberships for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "memberships_delete_admin"
  on public.memberships for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- bookings
-- Direct insert/update/delete is intentionally NOT granted to members.
-- Members must use book_class_session() / cancel_booking() (SECURITY
-- DEFINER, enforce capacity + membership + duplicate checks atomically).
-- ---------------------------------------------------------------------------

alter table public.bookings enable row level security;

create policy "bookings_select_own_or_admin"
  on public.bookings for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "bookings_admin_manage"
  on public.bookings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- announcements
-- ---------------------------------------------------------------------------

alter table public.announcements enable row level security;

create policy "announcements_select_published_or_admin"
  on public.announcements for select
  to authenticated, anon
  using (is_published or public.is_admin());

create policy "announcements_insert_admin"
  on public.announcements for insert
  to authenticated
  with check (public.is_admin());

create policy "announcements_update_admin"
  on public.announcements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "announcements_delete_admin"
  on public.announcements for delete
  to authenticated
  using (public.is_admin());
