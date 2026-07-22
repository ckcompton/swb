-- Swap waiver provider from Dropbox Sign to Jotform. Unlike Dropbox Sign,
-- Jotform Forms has no "create a signing request" API -- there's no
-- pre-existing pending row to match against by request id. The webhook now
-- knows the signer's profile id directly (read back from a hidden prefilled
-- form field), so mark_waiver_signed keys off profile_id and upserts.

drop function if exists public.mark_waiver_signed(text, text);

create or replace function public.mark_waiver_signed(
  p_profile_id uuid,
  p_submission_id text,
  p_document_url text,
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
  -- Idempotent: Jotform may redeliver the webhook, and a member may already
  -- have a signed row (the waivers_unique_signed index allows only one).
  select * into v_waiver
  from public.waivers
  where profile_id = p_profile_id
    and status = 'signed';

  if found then
    return v_waiver;
  end if;

  insert into public.waivers (profile_id, provider, provider_request_id, status, waiver_version, document_url, signed_at)
  values (p_profile_id, 'jotform', p_submission_id, 'signed', p_waiver_version, p_document_url, now())
  returning * into v_waiver;

  return v_waiver;
end;
$$;

revoke all on function public.mark_waiver_signed(uuid, text, text, text) from public;
grant execute on function public.mark_waiver_signed(uuid, text, text, text) to service_role;

alter table public.waivers alter column provider set default 'jotform';
