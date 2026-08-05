# Boxing Gym Waiver Platform

A public marketing site plus a lightweight admin back office. Visitors sign a liability waiver
directly on the site — no account required — and admins log in to review signed waivers.

## Product overview

- **Public website** — home, programs, coaches, pricing, and class schedule, all static
  informational content viewable without logging in.
- **Public waiver signing** (`/waiver`) — anyone can fill in their name/email/phone, draw a
  signature, and sign the liability waiver. No account or login is required. On success, both the
  signer and the gym admin receive a confirmation email.
- **Admins** log in and review signed waivers (`/admin/waivers`), including the rendered signature
  image, and manage the trainer roster (`/admin/trainers`).

## Current scope

- One role, `admin`. There is no member/booking account system — the `app_role` Postgres enum
  still exists structurally but only ever holds `admin` today.
- Waivers are the only thing members of the public write to the database, and they do so through
  a single narrow `SECURITY DEFINER` function (`sign_waiver_public`) rather than direct table
  access — see "Security notes" below.
- Email notifications (signer confirmation + admin alert) are sent via Resend on every successful
  waiver signature.

## Explicitly excluded from this phase

Class booking, memberships/billing, announcements, member accounts/login, and the mobile app's
booking/admin screens — all of that was removed in the pivot to a waiver-only, admin-only product.
Class sessions remain in the schema as static, read-only schedule content (no capacity, no
booking).

## Architecture overview

A small pnpm + Turborepo monorepo. The framework-independent business logic and data access live
in shared packages so both the web app and the Expo mobile app reuse them without any
platform-specific code duplicated.

```
apps/web                 Next.js 16 App Router web app (Server Components, Server Actions)
apps/mobile               Expo/React Native app (expo-router) — login-only MVP
packages/domain            Types, Zod schemas, shared errors — zero framework deps
packages/data-access        Supabase queries/mutations; every function takes an authenticated client
packages/config               Shared constants: roles, statuses, limits, design tokens, waiver text
packages/utils                  Pure formatting/date helpers
supabase/migrations              Schema, RLS, and the sign_waiver_public Postgres function
supabase/seed.sql                  Idempotent development seed data
```

`packages/domain`, `packages/data-access`, `packages/config`, and `packages/utils` never import
`next/*`, React, browser APIs, or `shadcn/ui`. `packages/data-access` functions accept a Supabase
client as an argument instead of creating one internally.

Waiver signing is a single synchronous Server Action (`signWaiverAction`) that uploads the
signature image to a private Storage bucket via the service-role client (there's no
`auth.uid()` for an anonymous signer), then calls the `sign_waiver_public` `SECURITY DEFINER`
Postgres function to insert the row. See
`supabase/migrations/20260805000001_public_waiver_signing.sql`.

## Repository structure

```
boxing-gym-platform/
├── apps/web
├── packages/{domain,data-access,config,utils}
├── supabase/{migrations,seed.sql}
├── CLAUDE.md
└── README.md
```

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm install -g pnpm`)
- Docker Desktop (required for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase` or see the [Supabase docs](https://supabase.com/docs/guides/cli))
- A [Resend](https://resend.com) API key (for waiver notification emails)

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

SUPABASE_SERVICE_ROLE_KEY=<from `supabase status`>

RESEND_API_KEY=<your Resend API key>
RESEND_FROM_EMAIL=Shadow Work Boxing <onboarding@resend.dev>
ADMIN_NOTIFICATION_EMAIL=<address to receive "new waiver signed" alerts>
```

`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` are server-only and must
never be prefixed `NEXT_PUBLIC_`. The service-role key is used in exactly one place:
`signWaiverAction`'s signature upload (see `apps/web/src/lib/supabase/service-role.ts`).

## Supabase local development

```bash
supabase start          # starts local Postgres, Auth, Storage, Studio (needs Docker running)
supabase status          # prints local API URL and keys for .env.local
```

### Migrations

Migrations in `supabase/migrations/` are the source of truth for the schema, RLS policies, and the
`sign_waiver_public` function. To apply them to your local database:

```bash
supabase db reset        # recreates the local DB, applies all migrations, then runs seed.sql
```

Create a new migration with:

```bash
supabase migration new <name>
```

### Seed data

`supabase/seed.sql` is idempotent (safe to re-run) and includes several trainers and a mix of
upcoming class sessions (including one canceled class) for the static schedule page. It
intentionally does **not** create admin accounts or waivers — accounts require real `auth.users`
rows created through Supabase Auth, and waivers are created through the public `/waiver` form.

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

Log in with the admin account (see below) — this MVP only implements login; after signing in
you'll see a placeholder welcome screen with a logout button.

## Creating a local admin account

There's no public signup anymore — only admins log in, and admin accounts are created directly in
Supabase Auth. `supabase/seed.sql` cannot create `auth.users` rows (Supabase Auth owns that
table), so every `supabase db reset` wipes accounts. Run this after any reset to restore a local
admin test account:

```bash
./scripts/seed-test-users.sh
```

It's idempotent (safe to re-run) and creates:

| Email                     | Role  | Password      |
| ------------------------- | ----- | ------------- |
| `check-select@test.local` | admin | `testpass123` |

### Promoting a different account to admin

```bash
supabase status   # confirms the local DB connection details
```

Then, using the Supabase Studio SQL editor (`http://127.0.0.1:54323`) or `psql`:

```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```

Find your user id in Supabase Studio under Authentication → Users, or in `public.profiles`.

## Test commands

```bash
pnpm test        # runs Vitest unit tests in packages/domain and packages/utils
```

Unit tests cover the waiver error-code mapping and shared formatting helpers — all pure functions.

## Production deployment notes

- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
  `NEXT_PUBLIC_SITE_URL` to your hosted Supabase project and production domain.
- Set `RESEND_API_KEY`/`RESEND_FROM_EMAIL` to a verified Resend sending domain — the sandbox
  `onboarding@resend.dev` sender only delivers to your own Resend account email.
- Run `supabase db push` (linked to your hosted project) to apply migrations, then run the
  relevant seed statements manually if you want sample data in a demo environment.
- `pnpm build` produces the Next.js production build (`apps/web/.next`). Deploy `apps/web` to any
  Next.js-compatible host (Vercel, etc.), keeping the shared packages in the same monorepo build.

## Security notes

- Row Level Security is enabled on every table (`profiles`, `trainers`, `class_sessions`,
  `waivers`), with explicit policies — see `supabase/migrations/20260716000004_rls.sql` and
  `20260805000001_public_waiver_signing.sql`.
- Table-level grants for `anon`/`authenticated` are separate from RLS policies and both are
  required for a query to succeed. `waivers` has **no** `anon`/`authenticated` select grant at
  all — only admins (via `is_admin()`) can read signed waivers.
- Public waiver signing does not use a table-level insert grant. It goes through the single
  narrow `sign_waiver_public` `SECURITY DEFINER` function, which validates the minor/guardian
  requirement server-side and is the only thing granted `EXECUTE` to `anon`.
- The signature-image Storage bucket (`waiver-signatures`) is private (`public: false`) and only
  readable by admins. Since an anonymous signer has no `auth.uid()`, the upload itself goes
  through the service-role client in `signWaiverAction` — the one sanctioned service-role
  exception in this codebase, scoped to exactly that one write.
- The `trainer-photos` Storage bucket is publicly readable but only writable by admins
  (`is_admin()` check in the storage policies). Uploaded file paths are generated server-side,
  never derived from the original filename.
- Server Components/Actions verify admin identity with `supabase.auth.getUser()` (a real
  round-trip to Auth), not `getSession()` alone, and check `profile.role` from the database —
  never a client-supplied value.

## Known limitations

- No email delivery is configured for local dev password-reset flows — those land in the local
  Inbucket/Mailpit inbox (`http://127.0.0.1:54324`), not a real inbox. Waiver notification emails
  go through Resend directly and require a real `RESEND_API_KEY` to send in any environment.
- No automated integration test suite for the waiver signing flow; it was manually verified
  end-to-end locally (form submission → DB row → Storage object → admin detail view).

## Expo mobile architecture

`apps/mobile` (Expo + expo-router) already reuses:

- `packages/domain` — types, Zod schemas (e.g. `loginSchema`), shared error types
- `packages/data-access` — the same repository functions (e.g. `getProfileById`), called with its
  own React Native Supabase client instead of the web client
- `packages/config` — shared constants (e.g. `DESIGN_TOKENS`)
- `packages/utils` — formatting/date helpers (e.g. `formatDisplayName`)

It brings its own:

- React Native UI components (not `shadcn/ui`, which stays web-only)
- Its own navigation via `expo-router` (file-based, under `apps/mobile/src/app`)
- Its own platform-specific Supabase client (`apps/mobile/src/lib/supabase.ts`, using
  `@react-native-async-storage/async-storage` for session persistence instead of cookies), passed
  into the shared `packages/data-access` functions exactly like the web client is:
  `getProfileById(mobileClient, userId)`.

This phase is login-only by design — no waiver or admin screens on mobile yet.

No Next.js-specific code (Server Actions, `next/headers`, `next/navigation`, the web Supabase
client/server/proxy modules) is reusable by the mobile app, by design.
