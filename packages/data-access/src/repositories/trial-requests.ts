import type { SupabaseClient } from "@supabase/supabase-js";
import type { TrialExperienceLevel, TrialRequestStatus } from "@boxing-gym/config";
import { APP_LIMITS } from "@boxing-gym/config";
import type { TrialRequest } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapTrialRequest } from "../mappers";

export interface CreateTrialRequestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  classSessionId: string;
  experienceLevel: TrialExperienceLevel;
  message?: string;
}

/**
 * Abuse protection: reject a new request if the same email already has a
 * request for the same class within the resubmission window. This runs as
 * an app-level check (rather than a DB constraint) because the window is
 * time-relative ("within the last N minutes"), which a unique index can't
 * express. See APP_LIMITS.trialRequestResubmitWindowMinutes.
 */
export async function hasRecentTrialRequest(
  client: SupabaseClient<Database>,
  email: string,
  classSessionId: string,
): Promise<boolean> {
  const since = new Date(
    Date.now() - APP_LIMITS.trialRequestResubmitWindowMinutes * 60 * 1000,
  ).toISOString();

  const { data, error } = await client
    .from("trial_requests")
    .select("id")
    .eq("email", email)
    .eq("class_session_id", classSessionId)
    .gte("created_at", since)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function createTrialRequest(
  client: SupabaseClient<Database>,
  input: CreateTrialRequestInput,
): Promise<TrialRequest> {
  const { data, error } = await client
    .from("trial_requests")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      class_session_id: input.classSessionId,
      experience_level: input.experienceLevel,
      message: input.message ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTrialRequest(data);
}

export interface ListTrialRequestsOptions {
  status?: TrialRequestStatus;
}

export async function getTrialRequestsForAdmin(
  client: SupabaseClient<Database>,
  options: ListTrialRequestsOptions = {},
): Promise<TrialRequest[]> {
  let query = client.from("trial_requests").select("*").order("created_at", { ascending: false });

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapTrialRequest);
}

export async function getTrialRequestById(
  client: SupabaseClient<Database>,
  trialRequestId: string,
): Promise<TrialRequest | null> {
  const { data, error } = await client
    .from("trial_requests")
    .select("*")
    .eq("id", trialRequestId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTrialRequest(data) : null;
}

export async function updateTrialRequestStatus(
  client: SupabaseClient<Database>,
  trialRequestId: string,
  status: TrialRequestStatus,
): Promise<TrialRequest> {
  const { data, error } = await client
    .from("trial_requests")
    .update({ status })
    .eq("id", trialRequestId)
    .select("*")
    .single();
  if (error) throw error;
  return mapTrialRequest(data);
}

export async function updateTrialRequestNotes(
  client: SupabaseClient<Database>,
  trialRequestId: string,
  adminNotes: string | null,
): Promise<TrialRequest> {
  const { data, error } = await client
    .from("trial_requests")
    .update({ admin_notes: adminNotes })
    .eq("id", trialRequestId)
    .select("*")
    .single();
  if (error) throw error;
  return mapTrialRequest(data);
}

export async function deleteTrialRequest(
  client: SupabaseClient<Database>,
  trialRequestId: string,
): Promise<void> {
  const { error } = await client.from("trial_requests").delete().eq("id", trialRequestId);
  if (error) throw error;
}
