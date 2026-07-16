# CLAUDE.md

Project rules for this repository. Follow these in every session.

## Architecture rules

- Next.js App Router, Server Components by default. Add `"use client"` only for state, event
  handlers, browser APIs, or React Hook Form.
- Shared packages (`packages/domain`, `packages/data-access`, `packages/config`, `packages/utils`)
  must never import `next/*`, React, React Native, browser-only APIs, or `shadcn/ui`. They must
  work unmodified in a future Expo app.
- `packages/data-access` functions accept an authenticated `SupabaseClient<Database>` as their
  first argument — never create a Supabase client internally. This lets the same function be
  called from Next.js Server Components/Actions and from a future mobile app.
- All Zod input schemas live in `packages/domain/src/schemas`. Client forms, Server Actions, and
  (later) mobile forms must reuse them — never duplicate validation logic.
- Web-specific UI lives only in `apps/web/src/components` and `apps/web/src/features`. Do not
  write it expecting React Native compatibility.
- Never query Supabase directly from a page or component — always go through
  `packages/data-access`.

## Security rules

- Row Level Security is mandatory on every table. New tables need an `enable row level security`
  statement and explicit policies in the same migration, plus a `grant` for the relevant
  Postgres role (`anon`/`authenticated`) — RLS policies alone do nothing without the matching
  table-level grant.
- Never use the service-role key in routine web request paths. It exists only for local
  seed/admin scripts, is never prefixed `NEXT_PUBLIC_`, and is never sent to the browser.
- Server-side authorization must call `supabase.auth.getUser()` (or use `requireMember()` /
  `requireAdmin()` from `apps/web/src/lib/auth.ts`), never trust a client-provided role or hidden
  UI state.
- Mutations that affect capacity or duplicate-booking correctness (booking, canceling) must go
  through the `book_class_session` / `cancel_booking` Postgres functions, not direct table writes.

## Zod + FormData

When a Zod field is optional and fed from a native `<form>` `FormData`, add `.nullable()` in
addition to `.optional()` — `FormData.get()` returns `null` for an unset key, and `null` is a
different value than `undefined` to Zod. Forgetting this produces a generic "Invalid input" error
with no useful message.

## Base UI button pattern

shadcn's `Button` here is the "base" (non-Radix) variant using `@base-ui/react`. There is no
`asChild` prop — use `render={<Link href="...">Label</Link>}` instead. When rendering as a
non-`<button>` element, pass `nativeButton={false}` or you'll get a console warning.

## Before declaring anything done

Run, in order, and fix all failures before saying a task is complete:

```
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For anything touching auth, booking, or admin mutations, also manually verify (or drive with
Playwright) the actual browser flow — a green build does not prove a Server Action or RLS policy
behaves correctly.
