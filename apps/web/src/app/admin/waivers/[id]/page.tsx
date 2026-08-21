import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getWaiverById, getWaiverSignatureUrl } from "@boxing-gym/data-access";
import { WAIVER_TITLE, WAIVER_SECTIONS, DESIGN_TOKENS } from "@boxing-gym/config";
import { formatDateTime, formatCalendarDate } from "@boxing-gym/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Signed waiver",
};

export default async function AdminWaiverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const waiver = await getWaiverById(supabase, id);
  if (!waiver) {
    notFound();
  }

  const signatureUrl = await getWaiverSignatureUrl(supabase, waiver.signaturePath);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {waiver.participantName}&apos;s waiver
      </h1>

      <Card>
        <CardHeader className="items-center text-center">
          <Image
            src="/logo-v2.png"
            alt={DESIGN_TOKENS.siteName}
            width={1100}
            height={475}
            className="h-16 w-auto"
          />
          <p className="mt-2 text-sm italic text-muted-foreground">{DESIGN_TOKENS.tagline}</p>
          <p className="text-xs text-muted-foreground">{DESIGN_TOKENS.address}</p>
          <Separator className="mt-4" />
          <CardTitle className="font-heading text-xl uppercase tracking-tight">
            {WAIVER_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 text-sm text-muted-foreground">
            {WAIVER_SECTIONS.map((section, index) => (
              <div key={section.heading}>
                <p className="mb-1 border-b-2 border-gold pb-1 font-heading text-xs uppercase tracking-wide text-foreground">
                  Section {index + 1} — {section.heading}
                </p>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mb-2 mt-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Participant</dt>
            <dd className="font-medium">{waiver.participantName}</dd>

            <dt className="text-muted-foreground">Date of birth</dt>
            <dd className="font-medium">{formatCalendarDate(waiver.dateOfBirth)}</dd>

            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{waiver.participantEmail}</dd>

            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{waiver.participantPhone}</dd>

            <dt className="text-muted-foreground">Address</dt>
            <dd className="font-medium">{waiver.address}</dd>

            <dt className="text-muted-foreground">Emergency contact</dt>
            <dd className="font-medium">
              {waiver.emergencyContactName} ({waiver.emergencyContactRelationship}) —{" "}
              {waiver.emergencyContactPhone}
            </dd>

            <dt className="text-muted-foreground">Medical disclosure</dt>
            <dd className="font-medium">{waiver.medicalConditions}</dd>

            <dt className="text-muted-foreground">Photo/media consent</dt>
            <dd className="font-medium">{waiver.photoConsent ? "Granted" : "Declined"}</dd>

            {waiver.isMinor && (
              <>
                <dt className="text-muted-foreground">Parent/guardian</dt>
                <dd className="font-medium">{waiver.guardianName}</dd>
              </>
            )}

            <dt className="text-muted-foreground">Signed</dt>
            <dd className="font-medium">{formatDateTime(waiver.signedAt)}</dd>

            <dt className="text-muted-foreground">Waiver version</dt>
            <dd className="font-medium">{waiver.waiverVersion}</dd>
          </dl>

          <div className="mt-6">
            <p className="mb-2 text-sm text-muted-foreground">
              {waiver.isMinor ? "Parent/guardian signature" : "Signature"}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not a static asset Next's image optimizer should cache */}
            <img
              src={signatureUrl}
              alt={`${waiver.isMinor ? "Guardian" : "Participant"} signature`}
              className="h-40 max-w-full rounded-md border border-border bg-white"
              style={{ backgroundColor: "#ffffff" }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Digitally signed by {waiver.isMinor ? waiver.guardianName : waiver.participantName} on{" "}
              {formatDateTime(waiver.signedAt)}
              {waiver.ipAddress && <> from IP {waiver.ipAddress}</>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
