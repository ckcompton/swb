-- Expand the public waiver to match the full liability release form: date of
-- birth, phone, address, emergency contact, medical disclosure, and
-- photo/media consent. participant_phone was previously optional -- the full
-- form requires it, so backfill existing rows before tightening to not null.

alter table public.waivers
  add column date_of_birth date,
  add column address text,
  add column emergency_contact_name text,
  add column emergency_contact_relationship text,
  add column emergency_contact_phone text,
  add column medical_conditions text not null default 'None',
  add column photo_consent boolean not null default false;

update public.waivers
set date_of_birth = coalesce(date_of_birth, signed_at::date),
    address = coalesce(address, 'Not collected'),
    emergency_contact_name = coalesce(emergency_contact_name, 'Not collected'),
    emergency_contact_relationship = coalesce(emergency_contact_relationship, 'Not collected'),
    emergency_contact_phone = coalesce(emergency_contact_phone, 'Not collected'),
    participant_phone = coalesce(participant_phone, 'Not collected');

alter table public.waivers
  alter column date_of_birth set not null,
  alter column address set not null,
  alter column emergency_contact_name set not null,
  alter column emergency_contact_relationship set not null,
  alter column emergency_contact_phone set not null,
  alter column participant_phone set not null;

-- ---------------------------------------------------------------------------
-- sign_waiver_public: re-create with the additional required fields.
-- ---------------------------------------------------------------------------

drop function if exists public.sign_waiver_public(text, text, text, boolean, text, text, text);

create or replace function public.sign_waiver_public(
  p_participant_name text,
  p_date_of_birth date,
  p_participant_email text,
  p_participant_phone text,
  p_address text,
  p_emergency_contact_name text,
  p_emergency_contact_relationship text,
  p_emergency_contact_phone text,
  p_medical_conditions text,
  p_photo_consent boolean,
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
    participant_name, date_of_birth, participant_email, participant_phone,
    address, emergency_contact_name, emergency_contact_relationship,
    emergency_contact_phone, medical_conditions, photo_consent,
    is_minor, guardian_name, signature_path, waiver_version, signed_at
  )
  values (
    p_participant_name, p_date_of_birth, p_participant_email, p_participant_phone,
    p_address, p_emergency_contact_name, p_emergency_contact_relationship,
    p_emergency_contact_phone, coalesce(p_medical_conditions, 'None'), p_photo_consent,
    p_is_minor, p_guardian_name, p_signature_path, p_waiver_version, now()
  )
  returning * into v_waiver;

  return v_waiver;
end;
$$;

revoke all on function public.sign_waiver_public(
  text, date, text, text, text, text, text, text, text, boolean, boolean, text, text, text
) from public;
grant execute on function public.sign_waiver_public(
  text, date, text, text, text, text, text, text, text, boolean, boolean, text, text, text
) to anon, authenticated;
