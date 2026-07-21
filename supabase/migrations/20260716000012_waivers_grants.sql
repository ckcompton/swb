-- The original waivers migration only granted select/insert to authenticated,
-- but the waivers_admin_manage RLS policy (for all, using is_admin()) already
-- permits admins to update/delete at the row level -- Postgres also requires
-- the matching table-level grant, which was missing. Without it, admin
-- actions like resetWaiverForProfile fail with "permission denied for table
-- waivers" regardless of the RLS policy.
grant update, delete on public.waivers to authenticated;
