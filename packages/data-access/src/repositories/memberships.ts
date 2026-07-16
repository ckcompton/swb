import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipStatus } from "@boxing-gym/config";
import type { Membership, ProfileWithMembership } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapMembership, mapProfile } from "../mappers";

export async function getActiveMembershipForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<Membership | null> {
  const { data, error } = await client
    .from("memberships")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapMembership(data) : null;
}

export async function listMembershipsForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<Membership[]> {
  const { data, error } = await client
    .from("memberships")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapMembership);
}

export async function listMembersWithMemberships(
  client: SupabaseClient<Database>,
): Promise<ProfileWithMembership[]> {
  const { data: profiles, error: profilesError } = await client
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", { ascending: false });
  if (profilesError) throw profilesError;

  const { data: memberships, error: membershipsError } = await client
    .from("memberships")
    .select("*")
    .order("created_at", { ascending: false });
  if (membershipsError) throw membershipsError;

  const latestByProfile = new Map<string, (typeof memberships)[number]>();
  for (const membership of memberships) {
    if (!latestByProfile.has(membership.profile_id)) {
      latestByProfile.set(membership.profile_id, membership);
    }
  }

  return profiles.map((profile) => {
    const membership = latestByProfile.get(profile.id);
    return {
      ...mapProfile(profile),
      membership: membership ? mapMembership(membership) : null,
    };
  });
}

export interface CreateMembershipInput {
  profileId: string;
  planName: string;
  status: MembershipStatus;
  startsAt: string;
  endsAt?: string | null;
}

export async function createMembership(
  client: SupabaseClient<Database>,
  input: CreateMembershipInput,
): Promise<Membership> {
  const { data, error } = await client
    .from("memberships")
    .insert({
      profile_id: input.profileId,
      plan_name: input.planName,
      status: input.status,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapMembership(data);
}

export interface UpdateMembershipInput {
  planName?: string;
  status?: MembershipStatus;
  startsAt?: string;
  endsAt?: string | null;
}

export async function updateMembership(
  client: SupabaseClient<Database>,
  membershipId: string,
  input: UpdateMembershipInput,
): Promise<Membership> {
  const { data, error } = await client
    .from("memberships")
    .update({
      ...(input.planName !== undefined ? { plan_name: input.planName } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startsAt !== undefined ? { starts_at: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { ends_at: input.endsAt } : {}),
    })
    .eq("id", membershipId)
    .select("*")
    .single();
  if (error) throw error;
  return mapMembership(data);
}
