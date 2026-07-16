# Implementation Plan — Boxing Gym Management Platform MVP

## Stack (verified latest stable, 2026-07-16)

Next.js 16.2, React 19.2, Tailwind 4.3, @supabase/supabase-js 2.110, @supabase/ssr 0.12,
Zod 4.4, react-hook-form 7.81, @hookform/resolvers 5.4, TypeScript ~5.x (via Next, not raw 7.0 canary line),
Vitest 4.1, ESLint 10.7 (flat config), Prettier 3.9, Turborepo 2.10, pnpm 11.

Note: `typescript@7.0.2` returned by npm is a native-preview line; we pin to the latest stable 5.x
release actually shipped for tooling compatibility with Next 16 / ESLint configs.

## Repo layout

```
apps/web                 Next.js App Router web app
packages/domain           types, zod schemas, business rules, pure logic + unit tests
packages/data-access       Supabase query/mutation functions (take a client arg)
packages/config             shared constants (roles, statuses, limits)
packages/utils               date/formatting/capacity pure helpers
supabase/migrations, seed.sql
```

## Order of work

1. Foundation: pnpm workspace, turborepo, Next app, TS/ESLint/Prettier/Tailwind/shadcn, confirm blank build.
2. Supabase: CLI init, schema migrations (enums/tables/constraints/RLS/booking RPC), seed.sql, generated types.
3. Shared packages: domain (types/zod/rules/tests), config, utils, data-access (repositories).
4. Auth: browser/server/proxy Supabase clients, signup/login/logout/forgot/reset, profile auto-create trigger, protected layouts (member/admin).
5. Public site: home, pricing, trainers, schedule.
6. Member workflow: dashboard, membership status, browse/book/cancel classes end-to-end.
7. Admin workflow: members, memberships, trainers (CRUD+photo upload), classes CRUD, announcements CRUD.
8. Final verification: format, lint, typecheck, test, build; security/dead-code review.

## Non-goals (excluded scope)

Expo/mobile, payments, CMS, recurring billing, waitlists, check-in/QR, push/email marketing,
complex reporting, multi-location, social login, realtime (except where needed for booking correctness,
which we handle via DB transaction instead).

## Key correctness mechanism

Booking/cancel implemented as Postgres `SECURITY DEFINER` functions (`book_class_session`,
`cancel_booking`) using row locks / unique partial index to guarantee capacity and duplicate-booking
correctness under concurrency. RLS enabled on all tables; policies restrict direct table mutation so
clients must go through the safe functions for booking.
