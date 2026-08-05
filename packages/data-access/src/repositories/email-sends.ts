import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export interface LogEmailSendInput {
  emailType: string;
  recipient: string;
  success: boolean;
  resendId?: string | null;
  errorMessage?: string | null;
}

// Called with the service-role client from server-only email code -- never
// a user-facing write path. Records every outbound Resend attempt so usage
// against Resend's daily send limit can be tracked, regardless of whether
// the individual send succeeded or failed.
export async function logEmailSend(
  client: SupabaseClient<Database>,
  input: LogEmailSendInput,
): Promise<void> {
  const { error } = await client.from("email_sends").insert({
    email_type: input.emailType,
    recipient: input.recipient,
    success: input.success,
    resend_id: input.resendId ?? null,
    error_message: input.errorMessage ?? null,
  });
  if (error) throw error;
}

// Count of send attempts (success or failure) since local midnight -- used
// to show "N / 100 emails sent today" against Resend's free-tier daily
// limit. Counts attempts, not just successes, since a failed send still
// consumes reasoning about quota (though not Resend's actual quota) and is
// useful signal either way.
export async function countEmailSendsToday(client: SupabaseClient<Database>): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await client
    .from("email_sends")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay.toISOString());
  if (error) throw error;
  return count ?? 0;
}
