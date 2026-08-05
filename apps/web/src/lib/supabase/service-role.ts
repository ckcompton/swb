import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@boxing-gym/data-access";
import { env } from "@/lib/env";

// Service-role client that bypasses RLS. Per CLAUDE.md this must never sit
// in a routine user request path -- the one sanctioned exception is
// uploading a public waiver signature image (signWaiverAction, see
// apps/web/src/features/waiver/actions.ts), which has no auth.uid() to
// satisfy a normal storage RLS insert policy since the signer never logs in.
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
