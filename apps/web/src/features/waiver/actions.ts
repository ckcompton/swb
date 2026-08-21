"use server";

import { headers } from "next/headers";
import {
  waiverSignInputSchema,
  friendlyWaiverErrorMessage,
  mapPostgresErrorToWaiverErrorCode,
} from "@boxing-gym/domain";
import {
  buildWaiverSignaturePath,
  signWaiverPublic,
  uploadWaiverSignature,
} from "@boxing-gym/data-access";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendWaiverSignedEmails } from "@/lib/email/send-waiver-signed-emails";

export interface WaiverActionResult {
  success: boolean;
  error?: string;
}

export async function signWaiverAction(formData: FormData): Promise<WaiverActionResult> {
  const parsed = waiverSignInputSchema.safeParse({
    participantName: formData.get("participantName"),
    dateOfBirth: formData.get("dateOfBirth"),
    participantEmail: formData.get("participantEmail"),
    participantPhone: formData.get("participantPhone"),
    address: formData.get("address"),
    emergencyContactName: formData.get("emergencyContactName"),
    emergencyContactRelationship: formData.get("emergencyContactRelationship"),
    emergencyContactPhone: formData.get("emergencyContactPhone"),
    medicalConditions: formData.get("medicalConditions"),
    photoConsent: formData.get("photoConsent") === "true",
    isMinor: formData.get("isMinor") === "true",
    guardianName: formData.get("guardianName"),
    signatureDataUrl: formData.get("signatureDataUrl"),
    agreedToTerms: formData.get("agreedToTerms") === "true",
    waiverVersion: formData.get("waiverVersion"),
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Please check the waiver form." };
  }

  const base64 = parsed.data.signatureDataUrl.slice("data:image/png;base64,".length);
  const bytes = new Uint8Array(Buffer.from(base64, "base64"));

  // Vercel (and most reverse proxies) set x-forwarded-for as
  // "client, proxy1, proxy2..." -- the first entry is the original client.
  // Best-effort audit trail only, not used for any security decision.
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;

  // No auth.uid() exists for a public signer -- the storage RLS policy only
  // allows admin reads, so the upload itself must go through the
  // service-role client (see apps/web/src/lib/supabase/service-role.ts).
  const serviceRoleClient = createServiceRoleClient();
  const path = buildWaiverSignaturePath();

  let waiver;
  try {
    await uploadWaiverSignature(serviceRoleClient, path, bytes);

    // sign_waiver_public is a SECURITY DEFINER function granted to anon, so
    // this can run on the regular (unauthenticated) client -- it's the one
    // deliberately narrow public write surface, not an open table grant.
    const supabase = await createClient();
    waiver = await signWaiverPublic(supabase, {
      participantName: parsed.data.participantName,
      dateOfBirth: parsed.data.dateOfBirth,
      participantEmail: parsed.data.participantEmail,
      participantPhone: parsed.data.participantPhone,
      address: parsed.data.address,
      emergencyContactName: parsed.data.emergencyContactName,
      emergencyContactRelationship: parsed.data.emergencyContactRelationship,
      emergencyContactPhone: parsed.data.emergencyContactPhone,
      medicalConditions: parsed.data.medicalConditions,
      photoConsent: parsed.data.photoConsent,
      isMinor: parsed.data.isMinor,
      guardianName: parsed.data.guardianName,
      signaturePath: path,
      waiverVersion: parsed.data.waiverVersion,
      ipAddress,
    });
  } catch (error) {
    console.error("signWaiverAction: failed to save signed waiver", error);
    const code = mapPostgresErrorToWaiverErrorCode(error instanceof Error ? error.message : "");
    return { success: false, error: friendlyWaiverErrorMessage(code) };
  }

  // Signing succeeded -- email delivery is best-effort and must never fail
  // the user-facing submission. Pass the original signature data URL through
  // rather than re-fetching from Storage -- email clients can't authenticate
  // against the private, admin-only bucket.
  try {
    await sendWaiverSignedEmails(waiver, parsed.data.signatureDataUrl);
  } catch (error) {
    console.error(
      `[email] signWaiverAction: waiver ${waiver.id} saved successfully, but sending ` +
        `notification emails threw and was caught here (see [email] logs above for why):`,
      error,
    );
  }

  return { success: true };
}
