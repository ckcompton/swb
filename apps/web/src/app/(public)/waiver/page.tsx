import type { Metadata } from "next";
import { WaiverSigner } from "@/features/waiver/waiver-signer";

export const metadata: Metadata = {
  title: "Sign Waiver",
  description: "Sign the liability waiver before your first class.",
};

export default function WaiverPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Sign Waiver</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Read the waiver below, fill in your information, and sign to complete it.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Dev/testing note: confirmation emails currently send from{" "}
            <code>waivers@meetthecomptons.com</code>, a temporary verified domain used for testing —
            not a Shadow Work Boxing domain. This will be switched to a real gym domain before
            launch.
          </p>
        )}
      </div>
      <WaiverSigner />
    </div>
  );
}
