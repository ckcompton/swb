-- Class waitlists: schema, RLS, grants, and transaction-safe DB functions.

-- ---------------------------------------------------------------------------
-- waitlist_entries
-- ---------------------------------------------------------------------------

create type public.waitlist_status as enum ('waiting', 'promoted', 'left');

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.waitlist_status not null default 'waiting',
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index waitlist_entries_class_session_id_idx on public.waitlist_entries (class_session_id);
create index waitlist_entries_profile_id_idx on public.waitlist_entries (profile_id);

-- Position ordering only needs to be unique among still-waiting entries;
-- left/promoted rows keep their historical position but no longer compete.
create unique index waitlist_entries_unique_position
  on public.waitlist_entries (class_session_id, position)
  where (status = 'waiting');

-- Prevent duplicate ACTIVE waitlist entries for the same member + class,
-- mirroring bookings_unique_active_booking.
create unique index waitlist_entries_unique_active
  on public.waitlist_entries (class_session_id, profile_id)
  where (status = 'waiting');

create trigger waitlist_entries_set_updated_at
  before update on public.waitlist_entries
  for each row execute function public.set_updated_at();

alter table public.waitlist_entries enable row level security;

create policy "waitlist_entries_select_own_or_admin"
  on public.waitlist_entries for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "waitlist_entries_admin_manage"
  on public.waitlist_entries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.waitlist_entries to authenticated;
grant insert, update, delete on public.waitlist_entries to authenticated;

-- Public aggregate view: waitlist counts per class, without exposing
-- individual waitlist rows. Mirrors class_session_booked_counts.
create view public.class_session_waitlist_counts as
select
  class_session_id,
  count(*) as waitlist_count
from public.waitlist_entries
where status = 'waiting'
group by class_session_id;

grant select on public.class_session_waitlist_counts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helper: is a given member currently eligible to hold/receive a booking for
-- a class session? Active membership, class not started, class not canceled.
-- ---------------------------------------------------------------------------

create or replace function public.is_member_eligible_for_session(
  p_profile_id uuid,
  p_session public.class_sessions
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  v_membership_active boolean;
begin
  if p_session.status <> 'scheduled' or p_session.starts_at <= now() then
    return false;
  end if;

  select exists (
    select 1
    from public.memberships m
    where m.profile_id = p_profile_id
      and m.status = 'active'
      and m.starts_at <= now()
      and (m.ends_at is null or m.ends_at > now())
  ) into v_membership_active;

  return v_membership_active;
end;
$$;

-- ---------------------------------------------------------------------------
-- join_waitlist
-- ---------------------------------------------------------------------------

create or replace function public.join_waitlist(p_class_session_id uuid)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_session public.class_sessions%rowtype;
  v_active_count integer;
  v_next_position integer;
  v_entry public.waitlist_entries%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_session
  from public.class_sessions
  where id = p_class_session_id
  for update;

  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if not public.is_member_eligible_for_session(v_uid, v_session) then
    if v_session.status <> 'scheduled' or v_session.starts_at <= now() then
      raise exception 'CLASS_NOT_BOOKABLE';
    end if;
    raise exception 'MEMBERSHIP_INACTIVE';
  end if;

  if exists (
    select 1
    from public.bookings
    where class_session_id = p_class_session_id
      and profile_id = v_uid
      and status = 'booked'
  ) then
    raise exception 'ALREADY_BOOKED';
  end if;

  if exists (
    select 1
    from public.waitlist_entries
    where class_session_id = p_class_session_id
      and profile_id = v_uid
      and status = 'waiting'
  ) then
    raise exception 'ALREADY_WAITLISTED';
  end if;

  select count(*) into v_active_count
  from public.bookings
  where class_session_id = p_class_session_id
    and status = 'booked';

  if v_active_count < v_session.capacity then
    raise exception 'CLASS_NOT_FULL';
  end if;

  select coalesce(max(position), 0) + 1 into v_next_position
  from public.waitlist_entries
  where class_session_id = p_class_session_id
    and status = 'waiting';

  insert into public.waitlist_entries (class_session_id, profile_id, status, position)
  values (p_class_session_id, v_uid, 'waiting', v_next_position)
  returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.join_waitlist(uuid) from public;
grant execute on function public.join_waitlist(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- leave_waitlist
-- ---------------------------------------------------------------------------

create or replace function public.leave_waitlist(p_waitlist_entry_id uuid)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_entry public.waitlist_entries%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_entry
  from public.waitlist_entries
  where id = p_waitlist_entry_id
  for update;

  if not found then
    raise exception 'WAITLIST_ENTRY_NOT_FOUND';
  end if;

  if v_entry.profile_id <> v_uid then
    raise exception 'WAITLIST_ENTRY_NOT_FOUND';
  end if;

  -- Idempotent: leaving an entry that's already inactive is a no-op success.
  if v_entry.status <> 'waiting' then
    return v_entry;
  end if;

  update public.waitlist_entries
  set status = 'left'
  where id = p_waitlist_entry_id
  returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.leave_waitlist(uuid) from public;
grant execute on function public.leave_waitlist(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- cancel_booking: extended to atomically promote the first eligible
-- waitlisted member once a spot opens up, preserving waitlist order and
-- skipping ineligible entries without ever exceeding capacity.
-- ---------------------------------------------------------------------------

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_booking public.bookings%rowtype;
  v_session public.class_sessions%rowtype;
  v_candidate public.waitlist_entries%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.profile_id <> v_uid then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  -- Idempotent: canceling an already-canceled booking is a no-op success.
  if v_booking.status = 'canceled' then
    return v_booking;
  end if;

  -- Lock the class session so capacity/promotion checks serialize against
  -- concurrent bookings and cancellations for this class.
  select * into v_session
  from public.class_sessions
  where id = v_booking.class_session_id
  for update;

  update public.bookings
  set status = 'canceled'
  where id = p_booking_id
  returning * into v_booking;

  -- Walk the waitlist in position order, skipping any entry whose member is
  -- no longer eligible, until one is promoted or the waitlist is exhausted.
  -- Locking each candidate row prevents a concurrent leave_waitlist call
  -- from promoting a member who just left.
  loop
    select * into v_candidate
    from public.waitlist_entries
    where class_session_id = v_booking.class_session_id
      and status = 'waiting'
    order by position asc
    limit 1
    for update;

    if not found then
      exit;
    end if;

    if not public.is_member_eligible_for_session(v_candidate.profile_id, v_session) then
      update public.waitlist_entries
      set status = 'left'
      where id = v_candidate.id;
      continue;
    end if;

    -- Re-activate a canceled booking row if one exists, otherwise insert.
    update public.bookings
    set status = 'booked'
    where class_session_id = v_booking.class_session_id
      and profile_id = v_candidate.profile_id
      and status = 'canceled';

    if not found then
      insert into public.bookings (class_session_id, profile_id, status)
      values (v_booking.class_session_id, v_candidate.profile_id, 'booked');
    end if;

    update public.waitlist_entries
    set status = 'promoted'
    where id = v_candidate.id;

    exit;
  end loop;

  return v_booking;
end;
$$;

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;
