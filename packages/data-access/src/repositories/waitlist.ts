import type { SupabaseClient } from "@supabase/supabase-js";
import type { WaitlistEntry, WaitlistEntryWithProfile, WaitlistEntryWithSession } from "@boxing-gym/domain";
import { BookingError, mapPostgresErrorToBookingErrorCode } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapClassSession, mapProfile, mapWaitlistEntry } from "../mappers";

export async function joinWaitlist(
  client: SupabaseClient<Database>,
  classSessionId: string,
): Promise<WaitlistEntry> {
  const { data, error } = await client.rpc("join_waitlist", {
    p_class_session_id: classSessionId,
  });
  if (error) {
    throw new BookingError(mapPostgresErrorToBookingErrorCode(error.message));
  }
  return mapWaitlistEntry(data);
}

export async function leaveWaitlist(
  client: SupabaseClient<Database>,
  waitlistEntryId: string,
): Promise<WaitlistEntry> {
  const { data, error } = await client.rpc("leave_waitlist", {
    p_waitlist_entry_id: waitlistEntryId,
  });
  if (error) {
    throw new BookingError(mapPostgresErrorToBookingErrorCode(error.message));
  }
  return mapWaitlistEntry(data);
}

export async function getWaitlistEntryById(
  client: SupabaseClient<Database>,
  waitlistEntryId: string,
): Promise<WaitlistEntry | null> {
  const { data, error } = await client
    .from("waitlist_entries")
    .select("*")
    .eq("id", waitlistEntryId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWaitlistEntry(data) : null;
}

export async function getActiveWaitlistEntriesForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<WaitlistEntryWithSession[]> {
  const { data, error } = await client
    .from("waitlist_entries")
    .select("*, class_sessions ( * )")
    .eq("profile_id", profileId)
    .eq("status", "waiting")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data
    .filter((row) => row.class_sessions !== null)
    .map((row) => ({
      ...mapWaitlistEntry(row),
      classSession: mapClassSession(row.class_sessions!),
    }));
}

export async function getWaitlistPositionForProfile(
  client: SupabaseClient<Database>,
  classSessionId: string,
  profileId: string,
): Promise<number | null> {
  const { data, error } = await client
    .from("waitlist_entries")
    .select("position")
    .eq("class_session_id", classSessionId)
    .eq("profile_id", profileId)
    .eq("status", "waiting")
    .maybeSingle();
  if (error) throw error;
  return data ? data.position : null;
}

export async function getWaitlistForClassAdmin(
  client: SupabaseClient<Database>,
  classSessionId: string,
): Promise<WaitlistEntryWithProfile[]> {
  const { data, error } = await client
    .from("waitlist_entries")
    .select("*, profiles ( * )")
    .eq("class_session_id", classSessionId)
    .eq("status", "waiting")
    .order("position", { ascending: true });
  if (error) throw error;

  return data
    .filter((row) => row.profiles !== null)
    .map((row) => ({
      ...mapWaitlistEntry(row),
      profile: mapProfile(row.profiles!),
    }));
}

export async function getWaitlistCounts(
  client: SupabaseClient<Database>,
  classSessionIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (classSessionIds.length === 0) return counts;

  const { data, error } = await client
    .from("class_session_waitlist_counts")
    .select("class_session_id, waitlist_count")
    .in("class_session_id", classSessionIds);
  if (error) throw error;

  for (const row of data) {
    if (row.class_session_id) {
      counts.set(row.class_session_id, row.waitlist_count ?? 0);
    }
  }
  return counts;
}
