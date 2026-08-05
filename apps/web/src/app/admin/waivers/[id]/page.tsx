import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWaiverById, getWaiverSignatureUrl } from "@boxing-gym/data-access";
import { WAIVER_TITLE, WAIVER_PARAGRAPHS } from "@boxing-gym/config";
import { formatDateTime } from "@boxing-gym/utils";
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
        <CardHeader>
          <CardTitle className="font-heading text-xl uppercase tracking-tight">
            {WAIVER_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            {WAIVER_PARAGRAPHS.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <Separator className="my-6" />

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Participant</dt>
            <dd className="font-medium">{waiver.participantName}</dd>

            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{waiver.participantEmail}</dd>

            {waiver.participantPhone && (
              <>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{waiver.participantPhone}</dd>
              </>
            )}

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
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
