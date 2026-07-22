import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildWaiverFormUrl, getWaiverForProfile } from "@boxing-gym/data-access";
import { formatDisplayName } from "@boxing-gym/utils";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { WaiverSigner } from "@/features/waiver/waiver-signer";

export const metadata: Metadata = {
  title: "Sign waiver",
};

export default async function WaiverPage() {
  const auth = await requireMember();
  const supabase = await createClient();

  const waiver = await getWaiverForProfile(supabase, auth.userId);
  if (waiver?.status === "signed") {
    redirect("/dashboard/schedule");
  }

  const formId = process.env.JOTFORM_WAIVER_FORM_ID;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Liability waiver</h1>
      <p className="mb-6 text-muted-foreground">
        Before you can book a class, please read and sign our liability waiver. You&apos;ll only
        need to do this once.
      </p>
      {formId ? (
        <WaiverSigner
          formUrl={buildWaiverFormUrl({
            formId,
            profileId: auth.userId,
            name: formatDisplayName(auth.profile.firstName, auth.profile.lastName),
            email: auth.email,
          })}
        />
      ) : (
        <p className="text-sm text-destructive">
          Waiver signing is not configured yet. Contact the gym.
        </p>
      )}
    </div>
  );
}
