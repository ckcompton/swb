import "server-only";
import type { Waiver } from "@boxing-gym/domain";
import { logEmailSend } from "@boxing-gym/data-access";
import { DESIGN_TOKENS, WAIVER_TITLE, WAIVER_PARAGRAPHS } from "@boxing-gym/config";
import { formatDateTime, formatCalendarDate } from "@boxing-gym/utils";
import { getResend } from "@/lib/email/client";
import { env } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { WaiverSignedConfirmationEmail } from "@/emails/waiver-signed-confirmation";
import { WaiverSignedAdminAlertEmail } from "@/emails/waiver-signed-admin-alert";

// Best-effort notification pair sent after a waiver is successfully saved --
// callers should log and swallow errors from this rather than fail the
// user-facing submission (signing already succeeded once this is called).
// signatureDataUrl is the same "data:image/png;base64,..." string the
// browser produced -- passed straight through from the Server Action rather
// than re-fetched from Storage, since email clients can't authenticate
// against a private, signed-URL-only bucket and this guarantees the emailed
// image is byte-identical to what was uploaded. Both emails include the
// full waiver text, participant details, and signature: the signer's copy
// is their permanent record (no login needed to ever see it again), and
// the admin's copy is a full duplicate alongside the "View in admin" link.
//
// Every send attempt (success or failure) is logged to email_sends via the
// service-role client -- this is what powers the "N / 100 emails sent
// today" tile on /admin, tracking usage against Resend's daily send limit.
export async function sendWaiverSignedEmails(
  waiver: Waiver,
  signatureDataUrl: string,
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  console.log("[email] sendWaiverSignedEmails: starting", {
    waiverId: waiver.id,
    to: waiver.participantEmail,
    adminEmail: adminEmail || "(not set -- admin alert will be skipped)",
    from: from || "(not set)",
  });

  if (!from) {
    console.error(
      "[email] RESEND_FROM_EMAIL is not set in apps/web/.env.local -- no email will be sent.",
    );
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const resend = getResend();
  const signedAtLabel = formatDateTime(waiver.signedAt);
  const dateOfBirthLabel = formatCalendarDate(waiver.dateOfBirth);

  const jobs: {
    label: string;
    emailType: string;
    to: string;
    send: () => ReturnType<typeof resend.emails.send>;
  }[] = [
    {
      label: "confirmation",
      emailType: "waiver_signed_confirmation",
      to: waiver.participantEmail,
      send: () =>
        resend.emails.send(
          {
            from,
            to: [waiver.participantEmail],
            subject: `Your ${DESIGN_TOKENS.siteName} waiver is confirmed`,
            react: (
              <WaiverSignedConfirmationEmail
                siteName={DESIGN_TOKENS.siteName}
                waiverTitle={WAIVER_TITLE}
                waiverParagraphs={WAIVER_PARAGRAPHS}
                participantName={waiver.participantName}
                dateOfBirthLabel={dateOfBirthLabel}
                participantEmail={waiver.participantEmail}
                participantPhone={waiver.participantPhone}
                address={waiver.address}
                emergencyContactName={waiver.emergencyContactName}
                emergencyContactRelationship={waiver.emergencyContactRelationship}
                emergencyContactPhone={waiver.emergencyContactPhone}
                medicalConditions={waiver.medicalConditions}
                photoConsent={waiver.photoConsent}
                isMinor={waiver.isMinor}
                guardianName={waiver.guardianName}
                signedAtLabel={signedAtLabel}
                waiverVersion={waiver.waiverVersion}
                signatureDataUrl={signatureDataUrl}
              />
            ),
          },
          { idempotencyKey: `waiver-signed-confirmation/${waiver.id}` },
        ),
    },
  ];

  if (adminEmail) {
    jobs.push({
      label: "admin alert",
      emailType: "waiver_signed_admin_alert",
      to: adminEmail,
      send: () =>
        resend.emails.send(
          {
            from,
            to: [adminEmail],
            subject: `New waiver signed by ${waiver.participantName}`,
            react: (
              <WaiverSignedAdminAlertEmail
                siteName={DESIGN_TOKENS.siteName}
                waiverTitle={WAIVER_TITLE}
                waiverParagraphs={WAIVER_PARAGRAPHS}
                participantName={waiver.participantName}
                dateOfBirthLabel={dateOfBirthLabel}
                participantEmail={waiver.participantEmail}
                participantPhone={waiver.participantPhone}
                address={waiver.address}
                emergencyContactName={waiver.emergencyContactName}
                emergencyContactRelationship={waiver.emergencyContactRelationship}
                emergencyContactPhone={waiver.emergencyContactPhone}
                medicalConditions={waiver.medicalConditions}
                photoConsent={waiver.photoConsent}
                isMinor={waiver.isMinor}
                guardianName={waiver.guardianName}
                signedAtLabel={signedAtLabel}
                waiverVersion={waiver.waiverVersion}
                signatureDataUrl={signatureDataUrl}
                waiverUrl={`${env.NEXT_PUBLIC_SITE_URL}/admin/waivers/${waiver.id}`}
              />
            ),
          },
          { idempotencyKey: `waiver-signed-admin-alert/${waiver.id}` },
        ),
    });
  } else {
    console.warn(
      "[email] ADMIN_NOTIFICATION_EMAIL is not set in apps/web/.env.local -- skipping admin alert.",
    );
  }

  const serviceRoleClient = createServiceRoleClient();

  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      console.log(`[email] sending "${job.label}" to ${job.to}...`);
      const result = await job.send();
      if (result.error) {
        console.error(`[email] "${job.label}" to ${job.to} FAILED:`, result.error);
      } else {
        console.log(`[email] "${job.label}" to ${job.to} SENT -- Resend id: ${result.data?.id}`);
      }

      try {
        await logEmailSend(serviceRoleClient, {
          emailType: job.emailType,
          recipient: job.to,
          success: !result.error,
          resendId: result.data?.id ?? null,
          errorMessage: result.error?.message ?? null,
        });
      } catch (logError) {
        console.error(`[email] failed to log send of "${job.label}" to email_sends:`, logError);
      }

      return result;
    }),
  );

  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error(`[email] "${jobs[index].label}" to ${jobs[index].to} threw:`, result.reason);
      try {
        await logEmailSend(serviceRoleClient, {
          emailType: jobs[index].emailType,
          recipient: jobs[index].to,
          success: false,
          errorMessage:
            result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      } catch (logError) {
        console.error(`[email] failed to log threw-send to email_sends:`, logError);
      }
    }
  }
}
