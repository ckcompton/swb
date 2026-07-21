"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startWaiverSigningAction } from "@/features/waiver/actions";

type Status = "idle" | "loading" | "signing" | "signed" | "error";

export function WaiverSigner() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const onStart = async () => {
    setStatus("loading");
    setError(null);

    const result = await startWaiverSigningAction();
    if (!result.success || !result.signUrl || !result.clientId) {
      setStatus("error");
      setError(result.error ?? "Something went wrong.");
      return;
    }

    setStatus("signing");
    const { default: HelloSign } = await import("hellosign-embedded");
    const client = new HelloSign({ clientId: result.clientId });

    client.on("sign", () => {
      // The waivers row flips to "signed" once Dropbox Sign's webhook lands
      // (usually within seconds) -- not immediately here.
      setStatus("signed");
    });
    client.on("close", () => {
      setStatus((current) => (current === "signed" ? current : "idle"));
    });

    client.open(result.signUrl, { clientId: result.clientId, skipDomainVerification: true });
  };

  if (status === "signed") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Thanks -- your waiver is being recorded. This usually takes just a few seconds.
        </p>
        <Button onClick={() => router.push("/dashboard/schedule")}>Go to schedule</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={onStart} disabled={status === "loading" || status === "signing"}>
        {status === "loading" ? "Starting…" : "Read and sign waiver"}
      </Button>
    </div>
  );
}
