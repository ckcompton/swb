-- Logs every outbound Resend send attempt so we can track usage against
-- Resend's daily sending limit (100/day on the free tier). A waiver
-- signature results in up to 2 rows here (signer confirmation + admin
-- alert). Written by the service-role client from server-only email code
-- (apps/web/src/lib/email/send-waiver-signed-emails.tsx) -- never a
-- user-facing write path, so RLS is admin-read-only with no insert/update
-- grants for anon/authenticated at all.

create table public.email_sends (
  id uuid primary key default gen_random_uuid(),
  email_type text not null,
  recipient text not null,
  success boolean not null,
  resend_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index email_sends_created_at_idx on public.email_sends (created_at);

alter table public.email_sends enable row level security;

create policy "email_sends_select_admin"
  on public.email_sends for select
  to authenticated
  using (public.is_admin());

grant select on public.email_sends to authenticated;
