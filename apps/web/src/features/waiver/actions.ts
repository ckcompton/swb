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

  console.log(
    "startWaiverSigningAction: config present",
    JSON.stringify({
      apiKeyLength: apiKey.length,
      clientIdLength: clientId.length,
      templateIdLength: templateId.length,
      testMode: process.env.DROPBOX_SIGN_TEST_MODE === "true",
    }),
  );

  let signatureRequestId: string;
  let signatureId: string;
  try {
    console.log("startWaiverSigningAction: calling create_embedded_with_template");
    ({ signatureRequestId, signatureId } = await createEmbeddedSignatureRequestFromTemplate({
      apiKey,
      clientId,
      templateId,
      signerEmail: auth.email,
      signerName: formatDisplayName(auth.profile.firstName, auth.profile.lastName),
      testMode: process.env.DROPBOX_SIGN_TEST_MODE === "true",
    }));
    console.log("startWaiverSigningAction: got signatureRequestId", signatureRequestId);
  } catch (error) {
    console.error("startWaiverSigningAction: create_embedded_with_template threw", error);
    return { success: false, error: "Could not start the waiver signing session. Try again." };
  }

  try {
    const supabase = await createClient();
    await createPendingWaiver(supabase, {
      profileId: auth.userId,
      providerRequestId: signatureRequestId,
      waiverVersion: WAIVER_VERSION,
    });
    console.log("startWaiverSigningAction: pending waiver row created");
  } catch (error) {
    console.error("startWaiverSigningAction: createPendingWaiver threw", error);
    return { success: false, error: "Could not start the waiver signing session. Try again." };
  }

  try {
    const { signUrl } = await getEmbeddedSignUrl({ apiKey, signatureId });
    console.log("startWaiverSigningAction: got sign url");
    return { success: true, signUrl, clientId };
  } catch (error) {
    console.error("startWaiverSigningAction: getEmbeddedSignUrl threw", error);
    return { success: false, error: "Could not start the waiver signing session. Try again." };
  }
}
