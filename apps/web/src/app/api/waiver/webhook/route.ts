import "server-only";
import { NextResponse } from "next/server";
import { getSubmission, markWaiverSigned, parseWebhookPayload } from "@boxing-gym/data-access";
import { WAIVER_VERSION } from "@boxing-gym/config";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Jotform callback. Public endpoint (no user session), and unlike Dropbox
// Sign, Jotform doesn't sign its callbacks with an HMAC -- so the posted
// body is never trusted directly. Instead we take the submissionID from it
// and re-fetch the authoritative submission from Jotform's API before
// writing anything, after checking the formID matches our configured form.
export async function POST(request: Request) {
  const apiKey = process.env.JOTFORM_API_KEY;
  const formId = process.env.JOTFORM_WAIVER_FORM_ID;
  if (!apiKey || !formId) {
    console.error("waiver webhook: JOTFORM_API_KEY or JOTFORM_WAIVER_FORM_ID missing");
    return new NextResponse("ok");
  }

  const formData = await request.formData();
  const event = parseWebhookPayload(formData);
  console.log("waiver webhook: received event", event.formId, event.submissionId);

  if (event.formId !== formId) {
    console.error("waiver webhook: formID mismatch, ignoring", event.formId);
    return new NextResponse("ok");
  }
  if (!event.submissionId) {
    console.error("waiver webhook: missing submissionID");
    return new NextResponse("ok");
  }

  try {
    const submission = await getSubmission({
      apiKey,
      submissionId: event.submissionId,
      apiBase: process.env.JOTFORM_API_BASE,
    });
    console.log("waiver webhook: fetched submission", submission.formId);

    const profileId = submission.answers.memberId;
    if (!profileId) {
      console.error("waiver webhook: submission missing memberId answer");
      return new NextResponse("ok");
    }

    const supabase = createServiceRoleClient();
    const waiver = await markWaiverSigned(supabase, {
      profileId,
      submissionId: event.submissionId,
      documentUrl: `/api/waiver/document/${event.submissionId}`,
      waiverVersion: WAIVER_VERSION,
    });
    console.log("waiver webhook: waiver marked signed", waiver.id, waiver.profileId);
  } catch (error) {
    // A member can submit the form more than once (retry, re-opened tab).
    // If a different one of their submissions already won the
    // one-signed-waiver-per-member slot (waivers_unique_signed), this
    // collides with code 23505 -- expected, not a real failure.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      console.log("waiver webhook: member already has a signed waiver, ignoring", error);
    } else {
      console.error("waiver webhook: failed to mark waiver signed", error);
    }
    // Still ack -- if this fails, the member's waiver stays unsigned and
    // they'll see the sign flow again, which is safe.
  }

  return new NextResponse("ok");
}
