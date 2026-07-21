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
    // Mis/unconfigured -- ack anyway so Dropbox Sign doesn't hammer retries;
    // there's nothing useful we can verify or persist without the key.
    return new NextResponse(ACK_BODY);
  }

  const rawBody = await request.text();

  let event;
  try {
    event = parseWebhookPayload(rawBody);
  } catch {
    return new NextResponse(ACK_BODY);
  }

  const verified = await verifyWebhookEventHash({
    apiKey,
    eventTime: event.eventTime,
    eventType: event.eventType,
    eventHash: event.eventHash,
  });
  if (!verified) {
    return new NextResponse(ACK_BODY);
  }

  if (event.eventType === "signature_request_all_signed" && event.signatureRequestId) {
    try {
      const documentUrl = await getSignedFileUrl({
        apiKey,
        signatureRequestId: event.signatureRequestId,
      });
      const supabase = createServiceRoleClient();
      await markWaiverSigned(supabase, event.signatureRequestId, documentUrl);
    } catch {
      // Swallow -- still ack so Dropbox Sign doesn't retry indefinitely.
      // If this fails, the member's waiver stays "pending" and they'll see
      // the sign flow again, which is safe (idempotent on their end too).
    }
  }

  return new NextResponse(ACK_BODY);
}
