-- Liability waiver e-signing: schema, RLS, grants, and the booking gate.

create table public.waivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'dropbox_sign',
  provider_request_id text,
  status text not null default 'pending' check (status in ('pending', 'signed')),
  waiver_version text not null,
  document_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index waivers_profile_id_idx on public.waivers (profile_id);
create index waivers_provider_request_id_idx on public.waivers (provider_request_id);

-- One signed waiver per member -- doesn't constrain how many pending/expired
-- attempts a member can have along the way.
create unique index waivers_unique_signed on public.waivers (profile_id) where (status = 'signed');

create trigger waivers_set_updated_at
  before update on public.waivers
  for each row execute function public.set_updated_at();

alter table public.waivers enable row level security;

create policy "waivers_select_own_or_admin"
  on public.waivers for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- Members may only create their own PENDING request -- they can never
-- self-mark a waiver as signed. Only the webhook-driven mark_waiver_signed
-- function (security definer, below) can flip status to 'signed'.
create policy "waivers_insert_own_pending"
  on public.waivers for insert
  to authenticated
  with check (profile_id = auth.uid() and status = 'pending');

create policy "waivers_admin_manage"
  on public.waivers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert on public.waivers to authenticated;

-- ---------------------------------------------------------------------------
-- mark_waiver_signed: called only by the Dropbox Sign webhook handler (after
-- HMAC verification), using the service-role client, never by a member
-- directly -- hence no membership/session checks like the booking functions.
-- ---------------------------------------------------------------------------

create or replace function public.mark_waiver_signed(p_request_id text, p_document_url text)
returns public.waivers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_waiver public.waivers%rowtype;
begin
  select * into v_waiver
  from public.waivers
  where provider_request_id = p_request_id
  for update;

  if not found then
    raise exception 'WAIVER_NOT_FOUND';
  end if;

  -- Idempotent: Dropbox Sign may redeliver the webhook.
  if v_waiver.status = 'signed' then
    return v_waiver;
  end if;

  update public.waivers
  set status = 'signed',
      signed_at = now(),
      document_url = p_document_url
  where id = v_waiver.id
  returning * into v_waiver;

  return v_waiver;
end;
$$;

revoke all on function public.mark_waiver_signed(text, text) from public;

-- ---------------------------------------------------------------------------
-- book_class_session: re-create (can't edit the original migration) to add a
-- signed-waiver requirement right after the membership check.
-- ---------------------------------------------------------------------------

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
  v_waiver_signed boolean;
  v_existing_booking public.bookings%rowtype;
  v_active_count integer;
  v_booking public.bookings%rowtype;
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

  select exists (
    select 1
    from public.waivers w
    where w.profile_id = v_uid
      and w.status = 'signed'
  ) into v_waiver_signed;

  if not v_waiver_signed then
    raise exception 'WAIVER_NOT_SIGNED';
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
