-- The original email_sends migration only granted SELECT to authenticated
-- (for the admin-read policy), but never granted service_role the INSERT
-- needed to actually write rows -- send-waiver-signed-emails.tsx logs every
-- send attempt using the service-role client (there's no admin/user session
-- at waiver-signing time), and every insert was failing with "permission
-- denied for table email_sends" as a result.

grant insert on public.email_sends to service_role;
