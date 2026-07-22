import type { SupabaseClient } from "@supabase/supabase-js";
import type { Waiver } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapWaiver } from "../mappers";

// A member's signed waiver if they have one (at most one can exist, per the
// waivers_unique_signed index) -- otherwise their most recent attempt,
// whatever its status, so a pending row can be resumed. Signed always wins
// regardless of recency: a member can accumulate multiple abandoned/retried
// pending rows after already signing (e.g. re-opening the sign flow), and
// those must never shadow the fact that they're already signed.
export async function getWaiverForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<Waiver | null> {
  const { data: signed, error: signedError } = await client
    .from("waivers")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "signed")
    .maybeSingle();
  if (signedError) throw signedError;
  if (signed) return mapWaiver(signed);

  const { data, error } = await client
    .from("waivers")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWaiver(data) : null;
}

export interface MarkWaiverSignedInput {
  profileId: string;
  submissionId: string;
  documentUrl: string;
  waiverVersion: string;
}

// Called by the Jotform webhook handler (after re-fetching the submission
// from Jotform's API) using a service-role client -- idempotently records
// the member's signed waiver. Unlike the prior Dropbox Sign flow, there's no
// pre-existing pending row to match -- Jotform gives no id until after
// submission, so this upserts keyed by profile_id.
export async function markWaiverSigned(
  client: SupabaseClient<Database>,
  input: MarkWaiverSignedInput,
): Promise<Waiver> {
  const { data, error } = await client.rpc("mark_waiver_signed", {
    p_profile_id: input.profileId,
    p_submission_id: input.submissionId,
    p_document_url: input.documentUrl,
    p_waiver_version: input.waiverVersion,
  });
  if (error) throw error;
  return mapWaiver(data);
}

// Admin-only reset: deletes all waiver rows (pending or signed) for a
// member so they're prompted to sign again from scratch. Relies on the
// waivers_admin_manage RLS policy (admin-only, "for all") -- callers must
// have already verified the caller is an admin.
export async function resetWaiverForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<void> {
  const { error } = await client.from("waivers").delete().eq("profile_id", profileId);
  if (error) throw error;
}

// Batched signed-waiver lookup for the admin members table, mirroring
// getBookedCounts / getWaitlistCounts.
export async function listSignedWaiverStatuses(
  client: SupabaseClient<Database>,
  profileIds: string[],
): Promise<Map<string, Waiver>> {
  const waivers = new Map<string, Waiver>();
  if (profileIds.length === 0) return waivers;

  const { data, error } = await client
    .from("waivers")
    .select("*")
    .in("profile_id", profileIds)
    .eq("status", "signed");
  if (error) throw error;

  for (const row of data) {
    waivers.set(row.profile_id, mapWaiver(row));
  }
  return waivers;
}
