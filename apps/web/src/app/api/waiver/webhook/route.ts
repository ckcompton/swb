import "server-only";
import { NextResponse } from "next/server";
import {
  getSignedFileUrl,
  markWaiverSigned,
  parseWebhookPayload,
  verifyWebhookEventHash,
} from "@boxing-gym/data-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Dropbox Sign callback. Public endpoint (no user session) -- every write
// is gated behind HMAC verification of the event payload. Must always
// respond 200 with the literal body below, or Dropbox Sign will retry (and
// eventually disable) the callback, including for its own verification
// ping when the URL is first configured.
const ACK_BODY = "Hello API Event Received";

export async function POST(request: Request) {
  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  if (!apiKey) {
    console.error("waiver webhook: DROPBOX_SIGN_API_KEY missing, cannot verify/process");
    // Mis/unconfigured -- ack anyway so Dropbox Sign doesn't hammer retries;
    // there's nothing useful we can verify or persist without the key.
    return new NextResponse(ACK_BODY);
  }

  const formData = await request.formData();
  const json = formData.get("json");
  if (typeof json !== "string") {
    console.error("waiver webhook: form data missing 'json' field");
    return new NextResponse(ACK_BODY);
  }

  let event;
  try {
    event = parseWebhookPayload(json);
  } catch (error) {
    console.error("waiver webhook: parseWebhookPayload threw", error);
    return new NextResponse(ACK_BODY);
  }

  console.log("waiver webhook: received event", event.eventType, event.signatureRequestId);

  const verified = await verifyWebhookEventHash({
    apiKey,
    eventTime: event.eventTime,
    eventType: event.eventType,
    eventHash: event.eventHash,
  });
  if (!verified) {
    console.error("waiver webhook: event hash verification failed", event.eventType);
    return new NextResponse(ACK_BODY);
  }

  if (event.eventType === "signature_request_all_signed" && event.signatureRequestId) {
    try {
      const documentUrl = await getSignedFileUrl({
        apiKey,
        signatureRequestId: event.signatureRequestId,
      });
      console.log("waiver webhook: got signed file url, marking waiver signed");
      const supabase = createServiceRoleClient();
      const waiver = await markWaiverSigned(supabase, event.signatureRequestId, documentUrl);
      console.log("waiver webhook: waiver marked signed", waiver.id, waiver.profileId);
    } catch (error) {
      // A member can end up with more than one pending waiver row (e.g. they
      // opened the sign flow more than once). If a different one of their
      // sessions already won the single-signed-waiver-per-member slot
      // (enforced by the waivers_unique_signed index), this insert/update
      // collides with code 23505 -- expected, not a real failure.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        console.log("waiver webhook: member already has a signed waiver, ignoring", error);
      } else {
        console.error("waiver webhook: failed to mark waiver signed", error);
      }
      // Still ack so Dropbox Sign doesn't retry indefinitely. If this fails,
      // the member's waiver stays "pending" and they'll see the sign flow
      // again, which is safe (idempotent on their end too).
    }
  } else {
    console.log("waiver webhook: ignoring event type", event.eventType);
  }

  return new NextResponse(ACK_BODY);
}
