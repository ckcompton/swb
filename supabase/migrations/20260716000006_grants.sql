-- Table-level privilege grants for PostgREST roles.
-- RLS policies restrict which ROWS are visible/mutable; these GRANTs are the
-- separate, required step that allows the anon/authenticated roles to touch
-- the tables/columns at all. Without both, every query returns "permission
-- denied" regardless of RLS policy contents.

grant usage on schema public to anon, authenticated;

-- Publicly browsable data (RLS still filters to active/published rows).
grant select on public.trainers to anon, authenticated;
grant select on public.class_sessions to anon, authenticated;
grant select on public.announcements to anon, authenticated;

-- Authenticated-only tables (RLS restricts to own rows or admin).
grant select, update on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant select on public.bookings to authenticated;

-- Admin-only mutations (RLS restricts to is_admin()).
grant insert, update, delete on public.trainers to authenticated;
grant insert, update, delete on public.class_sessions to authenticated;
grant insert, update, delete on public.announcements to authenticated;
grant insert, update, delete on public.memberships to authenticated;
grant insert, update, delete on public.bookings to authenticated;
