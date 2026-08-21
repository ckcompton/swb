import type { SupabaseClient } from "@supabase/supabase-js";
import type { Waiver } from "@boxing-gym/domain";
import { WAIVER_SIGNATURES_BUCKET } from "@boxing-gym/config";
import type { Database } from "../database.types";
import { mapWaiver } from "../mappers";

export function buildWaiverSignaturePath(): string {
  return `${crypto.randomUUID()}.png`;
}

// Uploads the signature PNG to the private waiver-signatures bucket. Must be
// called with a service-role client -- there is no auth.uid() for a public
// signer, so there's no RLS insert policy for anon/authenticated to satisfy.
export async function uploadWaiverSignature(
  client: SupabaseClient<Database>,
  path: string,
  bytes: Uint8Array,
): Promise<void> {
  const { error } = await client.storage.from(WAIVER_SIGNATURES_BUCKET).upload(path, bytes, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
}

// Short-lived signed URL -- the bucket is private and admin-read-only.
export async function getWaiverSignatureUrl(
  client: SupabaseClient<Database>,
  path: string,
): Promise<string> {
  const { data, error } = await client.storage
    .from(WAIVER_SIGNATURES_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export interface SignWaiverPublicInput {
  participantName: string;
  dateOfBirth: string;
  participantEmail: string;
  participantPhone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  photoConsent: boolean;
  isMinor: boolean;
  guardianName?: string | null;
  signaturePath: string;
  waiverVersion: string;
  ipAddress: string | null;
}

// The sole public write path -- calls the sign_waiver_public SECURITY
// DEFINER function, which is the only thing granted insert on this table.
export async function signWaiverPublic(
  client: SupabaseClient<Database>,
  input: SignWaiverPublicInput,
): Promise<Waiver> {
  const { data, error } = await client.rpc("sign_waiver_public", {
    p_participant_name: input.participantName,
    p_date_of_birth: input.dateOfBirth,
    p_participant_email: input.participantEmail,
    p_participant_phone: input.participantPhone,
    p_address: input.address,
    p_emergency_contact_name: input.emergencyContactName,
    p_emergency_contact_relationship: input.emergencyContactRelationship,
    p_emergency_contact_phone: input.emergencyContactPhone,
    p_medical_conditions: input.medicalConditions,
    p_photo_consent: input.photoConsent,
    p_is_minor: input.isMinor,
    // The generated RPC arg type is `string` because supabase gen types
    // doesn't reflect a plpgsql param's SQL nullability -- it's a nullable
    // text param and null is a valid value here.
    p_guardian_name: (input.guardianName ?? null) as string,
    p_signature_path: input.signaturePath,
    p_waiver_version: input.waiverVersion,
    p_ip_address: input.ipAddress as string,
  });
  if (error) throw error;
  return mapWaiver(data);
}

// Admin-only list, newest first.
export async function listWaivers(client: SupabaseClient<Database>): Promise<Waiver[]> {
  const { data, error } = await client
    .from("waivers")
    .select("*")
    .order("signed_at", { ascending: false });
  if (error) throw error;
  return data.map(mapWaiver);
}

export async function getWaiverById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Waiver | null> {
  const { data, error } = await client.from("waivers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapWaiver(data) : null;
}
