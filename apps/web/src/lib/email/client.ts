import "server-only";
import { Resend } from "resend";

let resend: Resend | undefined;

export function getResend(): Resend {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "[email] RESEND_API_KEY is not set in apps/web/.env.local -- no email will be sent. " +
        "Get a key at https://resend.com/api-keys and restart the dev server.",
    );
    throw new Error("RESEND_API_KEY is not configured");
  }

  console.log(`[email] Resend client initialized (key starts with "${apiKey.slice(0, 6)}...")`);
  resend = new Resend(apiKey);
  return resend;
}
