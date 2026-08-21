-- Record the signer's IP address alongside the signature as part of the
-- legal audit trail (shown as "Digitally signed by ... from <ip> at <time>"
-- on the confirmation/admin emails, the PDF, and the admin detail view).

alter table public.waivers
  add column ip_address text;

drop function if exists public.sign_waiver_public(
  text, date, text, text, text, text, text, text, text, boolean, boolean, text, text, text
);

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
  p_waiver_version text,
  p_ip_address text
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
    is_minor, guardian_name, signature_path, waiver_version, ip_address, signed_at
  )
  values (
    p_participant_name, p_date_of_birth, p_participant_email, p_participant_phone,
    p_address, p_emergency_contact_name, p_emergency_contact_relationship,
    p_emergency_contact_phone, coalesce(p_medical_conditions, 'None'), p_photo_consent,
    p_is_minor, p_guardian_name, p_signature_path, p_waiver_version, p_ip_address, now()
  )
  returning * into v_waiver;

  return v_waiver;
end;
$$;

revoke all on function public.sign_waiver_public(
  text, date, text, text, text, text, text, text, text, boolean, boolean, text, text, text, text
) from public;
grant execute on function public.sign_waiver_public(
  text, date, text, text, text, text, text, text, text, boolean, boolean, text, text, text, text
) to anon, authenticated;
