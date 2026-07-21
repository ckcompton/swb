# Member check-in → door unlock code

## Context

Members currently book classes but there's no check-in step and no door access concept anywhere
in the codebase (confirmed via full-repo search — this is greenfield). The goal is: when a member
checks in for a class they've booked, the app shows them a time-bound code they can punch into a
keypad lock on the gym door, without staff having to hand out or manage codes manually.

Constraints from the user: no door hardware purchased yet, wants the "app shows a PIN, member
types it into a keypad" flow (not a live "tap to unlock" button), and wants to keep monthly cost
low for a single door.

## Recommended hardware/service

**igloohome** smart lock (deadbolt/padlock/keybox depending on the actual door, ~$150–300
one-time) + the **igloohome REST API** directly, _not_ through the Seam aggregator. Reasoning:

- igloohome supports algorithmic, time-bound one-time/scheduled PIN codes generated via their API
  — exactly the "display a code that's only valid for this class's time window" flow requested.
- Going direct to igloohome's API (rather than through Seam) avoids Seam's added per-unlock/aggregator
  markup, since only one lock brand is needed — Seam's value is multi-brand abstraction, which
  isn't needed here.
- igloohome locks work fully offline for code validation — no gym WiFi dependency for the lock
  itself, only the code-generation call from the server needs internet access.
- If a specific door type turns out to be incompatible with igloohome's hardware lineup, Schlage
  Encode (via Seam) is the fallback — same code pattern below, just swap the API client.

This is genuinely a small project: buy + pair the lock (~1 hr), get an igloohome developer API
key, and add the code below (~200–300 lines across the stack). No custom electronics or wiring
beyond installing the lock itself.

## Implementation

### 1. Postgres: `check_in_to_class_session` function

New migration alongside `supabase/migrations/20260716000003_booking_functions.sql`, following its
exact pattern (`security definer`, `set search_path = public`, `v_uid := auth.uid()`, row-lock the
booking with `select ... for update`, raise plain-text exceptions like `BOOKING_NOT_FOUND`,
`ALREADY_CHECKED_IN`, `OUTSIDE_CHECKIN_WINDOW`, then `revoke all ... grant execute ... to
authenticated`). It should:

- Verify the caller has a `booked` booking for the session.
- Verify current time is within the session's check-in window (e.g. 15 min before `startsAt` to
  `endsAt`).
- Set a new `checked_in_at` timestamp on the booking row (add this column via the same migration).

### 2. Data-access: repository + igloohome client

- `packages/data-access/src/repositories/check-ins.ts` — mirrors `waitlist.ts`: calls the
  `check_in_to_class_session` RPC via the passed-in `SupabaseClient<Database>`, wraps Postgres
  exceptions into a typed error the same way `mapPostgresErrorToBookingErrorCode` does for
  bookings.
- `packages/data-access/src/services/igloohome.ts` — plain fetch-based client (no `next/*`, no
  Supabase) with one function, e.g. `getAccessCodeForWindow({ apiKey, lockId, startsAt, endsAt })`,
  that calls igloohome's API to create/fetch a time-bound PIN for that class session's window.
  Accepts config as arguments rather than reading `process.env` directly, consistent with the
  existing "no client creation inside data-access" rule.

### 3. Server Action (apps/web)

New Server Action (near the existing booking Server Actions) that:

1. Calls `requireMember()` for auth.
2. Calls the check-ins repository to run `check_in_to_class_session`.
3. On success, calls the igloohome service with the server-only `IGLOOHOME_API_KEY` env var to get
   the session's PIN, and returns it to the client.
   The igloohome API key stays server-side only (same rule as the Supabase service-role key —
   never `NEXT_PUBLIC_`, never sent to the browser).

### 4. UI

A check-in button on the member's booked-class view (`apps/web/src/features/...`, alongside
existing booking components) that calls the Server Action and displays the returned code with the
window it's valid for. Client Component only for the button/state (`"use client"`), same pattern
as existing booking UI.

### 5. Zod schema

Add `checkInSchema` to `packages/domain/src/schemas` (just a `classSessionId`), reused by the
Server Action, following the "all input schemas live in packages/domain" rule.

## Verification

- `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- Manually drive the flow: book a class as a test member, wait until inside the check-in window,
  check in, confirm the code shown matches what igloohome's API/lock accepts, confirm checking in
  twice or outside the window is rejected with a clear error.
- Confirm RLS: a member cannot check in to another member's booking, and the new `checked_in_at`
  column is only writable via the `security definer` function, not direct table update.
