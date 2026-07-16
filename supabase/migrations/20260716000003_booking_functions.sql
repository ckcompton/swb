-- Atomic, transaction-safe booking operations.
-- SECURITY DEFINER so they can check/write across tables while row-level
-- security still restricts direct table access to safe columns/rows only.

create or replace function public.book_class_session(p_class_session_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_session public.class_sessions%rowtype;
  v_membership_active boolean;
  v_existing_booking public.bookings%rowtype;
  v_active_count integer;
  v_booking public.bookings%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Lock the class session row for the duration of the transaction so
  -- concurrent bookings serialize on capacity checks for this class.
  select * into v_session
  from public.class_sessions
  where id = p_class_session_id
  for update;

  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;

  if v_session.status <> 'scheduled' or v_session.starts_at <= now() then
    raise exception 'CLASS_NOT_BOOKABLE';
  end if;

  select exists (
    select 1
    from public.memberships m
    where m.profile_id = v_uid
      and m.status = 'active'
      and m.starts_at <= now()
      and (m.ends_at is null or m.ends_at > now())
  ) into v_membership_active;

  if not v_membership_active then
    raise exception 'MEMBERSHIP_INACTIVE';
  end if;

  select * into v_existing_booking
  from public.bookings
  where class_session_id = p_class_session_id
    and profile_id = v_uid
    and status = 'booked';

  if found then
    raise exception 'ALREADY_BOOKED';
  end if;

  select count(*) into v_active_count
  from public.bookings
  where class_session_id = p_class_session_id
    and status = 'booked';

  if v_active_count >= v_session.capacity then
    raise exception 'CLASS_FULL';
  end if;

  -- Re-activate a canceled booking row if one exists for this member/class,
  -- otherwise insert a fresh row. Keeps history and satisfies the unique
  -- partial index on (class_session_id, profile_id) where status = 'booked'.
  update public.bookings
  set status = 'booked'
  where class_session_id = p_class_session_id
    and profile_id = v_uid
    and status = 'canceled'
  returning * into v_booking;

  if not found then
    insert into public.bookings (class_session_id, profile_id, status)
    values (p_class_session_id, v_uid, 'booked')
    returning * into v_booking;
  end if;

  return v_booking;
end;
$$;

revoke all on function public.book_class_session(uuid) from public;
grant execute on function public.book_class_session(uuid) to authenticated;

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_booking public.bookings%rowtype;
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

  update public.bookings
  set status = 'canceled'
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;
