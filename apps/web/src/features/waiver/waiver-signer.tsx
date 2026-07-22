"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Status = "signing" | "signed";

export function WaiverSigner({ formUrl }: { formUrl: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("signing");

  useEffect(() => {
    // Jotform's thank-you page posts { action: "submission-completed" } to
    // the parent window when embedded. This isn't a documented/stable API
    // (Jotform's own support says it may change), so it's a best-effort
    // signal -- the "I've finished signing" button below is the guaranteed
    // fallback. Either way, the waivers row only flips to "signed" once the
    // webhook lands server-side; this is just UI state.
    function onMessage(event: MessageEvent) {
      const data = event.data;
      const action = typeof data === "string" ? tryParseAction(data) : data?.action;
      if (action === "submission-completed") {
        setStatus("signed");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
      <iframe
        src={formUrl}
        title="Liability waiver"
        className="h-[70vh] w-full rounded-md border border-border"
      />
      <p className="text-sm text-muted-foreground">
        Once you&apos;ve submitted the signed form above, click below to continue.
      </p>
      <Button variant="outline" onClick={() => setStatus("signed")}>
        I&apos;ve finished signing
      </Button>
    </div>
  );
}

function tryParseAction(data: string): string | undefined {
  try {
    return JSON.parse(data)?.action;
  } catch {
    return undefined;
  }
}
