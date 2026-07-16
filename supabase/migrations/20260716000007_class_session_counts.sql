-- Public aggregate view: booked counts per class session, without exposing
-- individual booking rows (bookings stay private per-member/admin).
--
-- security_invoker is intentionally left at its default (false / definer
-- semantics) so the view aggregates across ALL bookings regardless of the
-- querying role's RLS visibility into public.bookings - it only ever
-- exposes a per-class COUNT, never row-level booking data, so this does not
-- leak who booked what.

create view public.class_session_booked_counts as
select
  class_session_id,
  count(*) as booked_count
from public.bookings
where status = 'booked'
group by class_session_id;

grant select on public.class_session_booked_counts to anon, authenticated;
