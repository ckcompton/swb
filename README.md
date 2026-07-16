# Boxing Gym Management Platform

A web MVP for managing a boxing gym: public marketing site, member class booking, and admin
tools for managing members, trainers, classes, and announcements.

## Product overview

- **Public website** — home, pricing, trainer roster, and class schedule, all viewable without
  logging in.
- **Members** sign up, view their membership status, browse upcoming classes, book/cancel a
  class (with capacity enforced), and see gym announcements.
- **Admins** manage member profiles and memberships, trainers (including photo upload), class
  sessions, and announcements (draft/publish).

## Current MVP scope

Everything listed above, plus:

- Two roles: `admin` and `member`. The role model is a Postgres enum (`app_role`) that can grow
  to add `coach` later without a schema rewrite — no coach dashboard exists yet.
- Admins manually activate/deactivate memberships. There is no payment processing.
- Announcements and all other content live in Supabase, not a CMS.

## Mobile app (iOS, MVP)

`apps/mobile` is an Expo/React Native (expo-router) app sharing the same Supabase project and the
same `packages/domain`, `data-access`, `config`, `utils` as the web app. **Scope is intentionally
minimal**: login only, using the same member/admin accounts created via the web app's signup
flow. After logging in it shows a placeholder welcome screen with a logout button — no booking,
schedule, or admin functionality yet. See "Running the mobile app" below.

## Explicitly excluded from this phase

Stripe/Apple in-app purchases, a CMS, recurring billing, waitlists, attendance check-in/QR codes,
push notifications, email marketing, complex reporting, multi-location support, social login, and
realtime subscriptions (booking correctness is handled by a database transaction instead of
realtime sync). The mobile app itself is now scaffolded (see above) but intentionally limited to
login only — booking/admin features on mobile are future work.

## Architecture overview

A small pnpm + Turborepo monorepo. The framework-independent business logic and data access live
in shared packages so both the web app and the Expo mobile app reuse them without any
platform-specific code duplicated.

```
apps/web                 Next.js 16 App Router web app (Server Components, Server Actions)
apps/mobile               Expo/React Native app (expo-router) — login-only MVP
packages/domain            Types, Zod schemas, business rules, shared errors — zero framework deps
packages/data-access        Supabase queries/mutations; every function takes an authenticated client
packages/config               Shared constants: roles, statuses, limits, design tokens
packages/utils                  Pure formatting/date/capacity helpers
supabase/migrations              Schema, RLS, and the atomic booking/cancel Postgres functions
supabase/seed.sql                  Idempotent development seed data
```

`packages/domain`, `packages/data-access`, `packages/config`, and `packages/utils` never import
`next/*`, React, browser APIs, or `shadcn/ui`. `packages/data-access` functions accept a
Supabase client as an argument (`getUpcomingSessions(client, options)`) instead of creating one
internally — `apps/mobile` already passes its own React Native Supabase client into these same
functions (see `apps/mobile/src/lib/supabase.ts` and `src/app/home.tsx`, which calls
`getProfileById` from `packages/data-access` unchanged).

Booking correctness (capacity limits, no duplicate active bookings, membership checks) is
enforced by two `SECURITY DEFINER` Postgres functions, `book_class_session` and `cancel_booking`,
which row-lock the class session for the duration of the check-and-insert so concurrent requests
cannot oversell a class. See `supabase/migrations/20260716000003_booking_functions.sql`.

## Repository structure

```
boxing-gym-platform/
├── apps/web
├── packages/{domain,data-access,config,utils}
├── supabase/{migrations,seed.sql}
├── IMPLEMENTATION_PLAN.md
├── CLAUDE.md
└── README.md
```

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm install -g pnpm`)
- Docker Desktop (required for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase` or see the [Supabase docs](https://supabase.com/docs/guides/cli))

## Installation

```bash
pnpm install
```

## Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the values from `supabase status`
(after starting Supabase locally, see below):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from `supabase status`>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No service-role key is required for normal web requests, and none is used in `apps/web`. If you
ever add a local seed/admin script that genuinely needs one, keep it server-only, document it
clearly, and never prefix it `NEXT_PUBLIC_`.

## Supabase local development

```bash
supabase start          # starts local Postgres, Auth, Storage, Studio (needs Docker running)
supabase status          # prints local API URL and keys for .env.local
```

### Migrations

Migrations in `supabase/migrations/` are the source of truth for the schema, RLS policies, and
the booking functions. To apply them to your local database:

```bash
supabase db reset        # recreates the local DB, applies all migrations, then runs seed.sql
```

Create a new migration with:

```bash
supabase migration new <name>
```

### Seed data

`supabase/seed.sql` is idempotent (safe to re-run) and includes several trainers, a mix of
upcoming classes (including one canceled class), and a few announcements (published and draft).
It intentionally does **not** create member/admin accounts or memberships, since those require
real `auth.users` rows created through Supabase Auth.

### Regenerating database types

`packages/data-access/src/database.types.ts` is generated from the live schema. After changing a
migration, regenerate it:

```bash
supabase gen types typescript --local > packages/data-access/src/database.types.ts
```

## Running the app

```bash
pnpm dev      # starts the Next.js dev server (apps/web) via Turborepo
```

Visit `http://localhost:3000`.

## Running the mobile app

The mobile app needs its own env file (`apps/mobile/.env.example` → `apps/mobile/.env.local`),
same idea as the web app:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from `supabase status`>
```

`127.0.0.1` only works for the iOS Simulator (it shares the host's network). Running on a
physical device requires your machine's LAN IP instead (e.g. `http://192.168.1.23:54321`) since
the device can't resolve `127.0.0.1` as your computer.

```bash
cd apps/mobile
pnpm ios      # opens the iOS Simulator via Expo (requires Xcode)
# or
pnpm start    # starts Metro; scan the QR code with Expo Go on a physical device
```

Log in with any member or admin account created through the web app's `/signup` flow (or the
mock accounts below) — accounts are shared across both apps because they're the same Supabase
Auth users. This MVP only implements login; after signing in you'll see a placeholder welcome
screen with a logout button.

## Creating test accounts

There's no social login or seeded users — sign up through the app at `/signup`. New accounts get
the `member` role automatically (via the `handle_new_user` trigger on `auth.users`).

### Promoting the first admin

After signing up, promote your account to admin directly in the database:

```bash
supabase status   # confirms the local DB connection details
```

Then, using the Supabase Studio SQL editor (`http://127.0.0.1:54323`) or `psql`:

```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```

Find your user id in Supabase Studio under Authentication → Users, or in `public.profiles`.

### Activating a member's membership

Admins manage this from `/admin/members` → "Add membership" / "Edit membership". There is no
self-service membership purchase flow in this MVP.

## Test commands

```bash
pnpm test        # runs Vitest unit tests in packages/domain and packages/utils
```

Unit tests cover membership-active calculation, class-bookable/capacity calculation, and
booking-error-code mapping — all pure functions in `packages/domain`.

### Manual verification of the atomic booking function

The `book_class_session` / `cancel_booking` Postgres functions were manually verified against a
live local database for:

- Successful booking under capacity
- `CLASS_FULL` when a class is at capacity
- `ALREADY_BOOKED` on a duplicate active booking
- `MEMBERSHIP_INACTIVE` when the caller has no active membership
- Idempotent cancellation (canceling twice is a no-op success)
- Re-booking after a cancellation reuses the same booking row

To repeat this manually: open two `psql` sessions against the local DB, wrap each call in
`begin; select set_config('request.jwt.claims', '{"sub":"<user-id>","role":"authenticated"}', true); select public.book_class_session('<class-id>'); commit;`
and confirm the expected error/success for each scenario above.

## Production deployment notes

- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
  `NEXT_PUBLIC_SITE_URL` to your hosted Supabase project and production domain.
- Run `supabase db push` (linked to your hosted project) to apply migrations, then run the
  relevant seed statements manually if you want sample data in a demo environment — do not run
  `supabase/seed.sql` against a real production database with real member data.
- `pnpm build` produces the Next.js production build (`apps/web/.next`). Deploy `apps/web` to any
  Next.js-compatible host (Vercel, etc.), keeping the shared packages in the same monorepo build.

## Security notes

- Row Level Security is enabled on every table (`profiles`, `trainers`, `class_sessions`,
  `memberships`, `bookings`, `announcements`), with explicit policies — see
  `supabase/migrations/20260716000004_rls.sql`.
- Table-level grants for `anon`/`authenticated` are separate from RLS policies and live in
  `supabase/migrations/20260716000006_grants.sql` — both are required for a query to succeed.
- Booking/cancellation bypass direct table RLS entirely; members must go through the
  `SECURITY DEFINER` `book_class_session`/`cancel_booking` functions, which independently verify
  authentication, membership status, capacity, and duplicate bookings inside one transaction.
- The Storage bucket `trainer-photos` is publicly readable but only writable by admins
  (`is_admin()` check in the storage policies). Uploaded file paths are generated server-side
  (`<trainerId>/<uuid>.<ext>`), never derived from the original filename.
- Server Components/Actions verify identity with `supabase.auth.getUser()` (a real round-trip to
  Auth), not `getSession()` alone, and check `profile.role` from the database — never a
  client-supplied value.

## Known limitations

- No automated integration test suite for the Postgres booking function (documented manual
  verification procedure above); a future phase could add pgTAP or a scripted Playwright/DB test.
- No email delivery is configured for local dev — password reset and signup-confirmation emails
  land in the local Inbucket/Mailpit inbox (`http://127.0.0.1:54324`), not a real inbox.
- No automated concurrency/load test for the booking function; correctness under concurrency
  relies on the `for update` row lock in `book_class_session`, which is the standard, well-tested
  Postgres pattern for this problem, but has not been load-tested in this repo.

## Expo mobile architecture

`apps/mobile` (Expo + expo-router) already reuses:

- `packages/domain` — types, Zod schemas (e.g. `loginSchema`), business rules, shared error types
- `packages/data-access` — the same repository functions (e.g. `getProfileById`), called with its
  own React Native Supabase client instead of the web client
- `packages/config` — shared constants (e.g. `DESIGN_TOKENS`)
- `packages/utils` — formatting/date/capacity helpers (e.g. `formatDisplayName`)

It brings its own:

- React Native UI components (not `shadcn/ui`, which stays web-only)
- Its own navigation via `expo-router` (file-based, under `apps/mobile/src/app`)
- Its own platform-specific Supabase client (`apps/mobile/src/lib/supabase.ts`, using
  `@react-native-async-storage/async-storage` for session persistence instead of cookies), passed
  into the shared `packages/data-access` functions exactly like the web client is:
  `getProfileById(mobileClient, userId)`.

This phase is login-only by design — no booking, schedule, or admin screens on mobile yet. A
future phase would add those screens, reusing the same shared packages the web app's member
workflow already uses.

No Next.js-specific code (Server Actions, `next/headers`, `next/navigation`, the web Supabase
client/server/proxy modules) is reusable by the mobile app, by design.
