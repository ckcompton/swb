-- mark_waiver_signed revoked EXECUTE from public (20260716000011) but never
-- re-granted it to service_role. A function's only default privilege is
-- EXECUTE to PUBLIC, so revoking that left no role able to call it at all --
-- including the service-role client the waiver webhook uses to call it.
grant execute on function public.mark_waiver_signed(text, text) to service_role;
