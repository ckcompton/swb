-- Groups recurring weekly class sessions together. Nullable, no FK to a
-- separate table -- it's purely a display/grouping label. Each occurrence
-- remains a fully independent class_sessions row, so booking, capacity, and
-- cancellation logic all continue to operate per-row unchanged.
alter table public.class_sessions add column series_id uuid;
create index class_sessions_series_id_idx on public.class_sessions (series_id);
