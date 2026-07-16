import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapProfile } from "../mappers";

export async function getProfileById(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function listAllProfiles(client: SupabaseClient<Database>): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapProfile);
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export async function updateOwnProfile(
  client: SupabaseClient<Database>,
  profileId: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const { data, error } = await client
    .from("profiles")
    .update({
      ...(input.firstName !== undefined ? { first_name: input.firstName } : {}),
      ...(input.lastName !== undefined ? { last_name: input.lastName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    })
    .eq("id", profileId)
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}
