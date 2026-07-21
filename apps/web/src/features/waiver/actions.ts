"use server";

import {
  createEmbeddedSignatureRequestFromTemplate,
  createPendingWaiver,
  getEmbeddedSignUrl,
} from "@boxing-gym/data-access";
import { WAIVER_VERSION } from "@boxing-gym/config";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { formatDisplayName } from "@boxing-gym/utils";

export interface StartWaiverSigningResult {
  success: boolean;
  error?: string;
  signUrl?: string;
  clientId?: string;
}

export async function startWaiverSigningAction(): Promise<StartWaiverSigningResult> {
  const auth = await requireMember();

  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const clientId = process.env.DROPBOX_SIGN_CLIENT_ID;
  const templateId = process.env.WAIVER_TEMPLATE_ID;
  if (!apiKey || !clientId || !templateId) {
    return { success: false, error: "Waiver signing is not configured yet. Contact the gym." };
  }

  if (!auth.email) {
    return { success: false, error: "Your account is missing an email address." };
  }

  try {
    const { signatureRequestId, signatureId } = await createEmbeddedSignatureRequestFromTemplate({
      apiKey,
      clientId,
      templateId,
      signerEmail: auth.email,
      signerName: formatDisplayName(auth.profile.firstName, auth.profile.lastName),
      testMode: process.env.DROPBOX_SIGN_TEST_MODE === "true",
    });

    const supabase = await createClient();
    await createPendingWaiver(supabase, {
      profileId: auth.userId,
      providerRequestId: signatureRequestId,
      waiverVersion: WAIVER_VERSION,
    });

    const { signUrl } = await getEmbeddedSignUrl({ apiKey, signatureId });
    return { success: true, signUrl, clientId };
  } catch (error) {
    console.error("startWaiverSigningAction failed", error);
    return { success: false, error: "Could not start the waiver signing session. Try again." };
  }
}
