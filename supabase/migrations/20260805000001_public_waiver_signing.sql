-- Product pivot: members no longer have accounts. Booking, memberships,
-- waitlists, trial requests, and announcements are removed entirely; class
-- sessions stay as static read-only schedule content. The waiver flow moves
-- from an authenticated-member, third-party-e-sign (Jotform) flow to a fully
-- public, no-login, native in-app signature -- anyone can sign without an
-- account, and only admins can read signed waivers.

-- ---------------------------------------------------------------------------
-- Drop booking/membership/waitlist/trial-request/announcement objects, in
-- dependency order (functions/views before the tables they reference).
-- ---------------------------------------------------------------------------

drop function if exists public.cancel_booking(uuid);
drop function if exists public.leave_waitlist(uuid);
drop function if exists public.join_waitlist(uuid);
drop function if exists public.is_member_eligible_for_session(uuid, public.class_sessions);
drop function if exists public.book_class_session(uuid);

drop view if exists public.class_session_waitlist_counts;
drop view if exists public.class_session_booked_counts;

drop table if exists public.waitlist_entries;
drop table if exists public.trial_requests;
drop table if exists public.bookings;
drop table if exists public.announcements;
drop table if exists public.memberships;

alter table public.class_sessions drop column if exists allows_free_trial;
alter table public.class_sessions drop column if exists series_id;
alter table public.class_sessions drop column if exists created_by;
alter table public.class_sessions drop column if exists capacity;

drop type if exists public.waitlist_status;
drop type if exists public.trial_request_status;
drop type if exists public.trial_experience_level;
drop type if exists public.booking_status;
drop type if exists public.membership_status;

-- ---------------------------------------------------------------------------
-- Rewrite waivers: drop the Jotform/Dropbox-Sign provider columns and the
-- authenticated-member coupling (profile_id), add native-signature columns.
-- Every remaining row is inherently "signed" -- there is no more pending
-- state, so `status` goes away too.
-- ---------------------------------------------------------------------------

drop function if exists public.mark_waiver_signed(uuid, text, text, text);

drop policy if exists "waivers_select_own_or_admin" on public.waivers;
drop policy if exists "waivers_insert_own_pending" on public.waivers;
drop policy if exists "waivers_admin_manage" on public.waivers;

revoke all on public.waivers from authenticated;

alter table public.waivers
  drop column provider,
  drop column provider_request_id,
  drop column status,
  drop column document_url,
  drop column profile_id;

alter table public.waivers
  add column participant_name text not null,
  add column participant_email text not null,
  add column participant_phone text,
  add column is_minor boolean not null default false,
  add column guardian_name text,
  add column signature_path text not null;

alter table public.waivers
  alter column signed_at set not null,
  alter column signed_at set default now();

alter table public.waivers
  add constraint waivers_guardian_name_required_if_minor
    check (not is_minor or guardian_name is not null);

drop trigger if exists waivers_set_updated_at on public.waivers;
alter table public.waivers drop column if exists updated_at;

drop index if exists waivers_profile_id_idx;
drop index if exists waivers_provider_request_id_idx;
drop index if exists waivers_unique_signed;

create index waivers_participant_email_idx on public.waivers (participant_email);

-- Admin-only read. No anon/authenticated select policy at all -- this is
-- PII/legal data from unauthenticated walk-in signers, so there is no
-- "own row" concept to grant against.
create policy "waivers_select_admin"
  on public.waivers for select
  to authenticated
  using (public.is_admin());

create policy "waivers_admin_manage"
  on public.waivers for delete
  to authenticated
  using (public.is_admin());

grant select, delete on public.waivers to authenticated;
revoke insert, update on public.waivers from authenticated;

-- ---------------------------------------------------------------------------
-- sign_waiver_public: the sole public write path. SECURITY DEFINER so it can
-- insert despite no anon/authenticated insert grant on the table itself --
-- keeps the public write surface to exactly one narrow, validated function
-- instead of an open table-level insert policy.
-- ---------------------------------------------------------------------------

create or replace function public.sign_waiver_public(
  p_participant_name text,
  p_participant_email text,
  p_participant_phone text,
  p_is_minor boolean,
  p_guardian_name text,
  p_signature_path text,
  p_waiver_version text
)
returns public.waivers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_waiver public.waivers%rowtype;
begin
  if p_is_minor and p_guardian_name is null then
    raise exception 'GUARDIAN_NAME_REQUIRED';
  end if;

  insert into public.waivers (
    participant_name, participant_email, participant_phone,
    is_minor, guardian_name, signature_path, waiver_version, signed_at
  )
  values (
    p_participant_name, p_participant_email, p_participant_phone,
    p_is_minor, p_guardian_name, p_signature_path, p_waiver_version, now()
  )
  returning * into v_waiver;

  return v_waiver;
end;
$$;

revoke all on function public.sign_waiver_public(text, text, text, boolean, text, text, text)
  from public;
grant execute on function public.sign_waiver_public(text, text, text, boolean, text, text, text)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private storage bucket for signature images. No auth.uid() exists for a
-- public signer, so there's no per-owner path prefix to check -- writes go
-- through a service-role Server Action (never anon/authenticated insert
-- policy); admins may read.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('waiver-signatures', 'waiver-signatures', false, 1048576, array['image/png'])
on conflict (id) do nothing;

create policy "waiver_signatures_admin_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'waiver-signatures' and public.is_admin());
