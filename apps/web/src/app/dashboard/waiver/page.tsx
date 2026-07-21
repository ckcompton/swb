import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWaiverForProfile } from "@boxing-gym/data-access";
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Liability waiver</h1>
      <p className="mb-6 text-muted-foreground">
        Before you can book a class, please read and sign our liability waiver. You&apos;ll only
        need to do this once.
      </p>
      <WaiverSigner />
    </div>
  );
}
