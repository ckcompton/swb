"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignaturePad({
  onChange,
  invalid,
}: {
  onChange: (dataUrl: string | null) => void;
  invalid?: boolean;
}) {
  const padRef = useRef<SignatureCanvas>(null);

  const emitValue = () => {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      onChange(null);
      return;
    }
    onChange(pad.getTrimmedCanvas().toDataURL("image/png"));
  };

  const clear = () => {
    padRef.current?.clear();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-md border border-input bg-white",
          invalid && "border-destructive ring-3 ring-destructive/20",
        )}
      >
        <SignatureCanvas
          ref={padRef}
          penColor="#1a1a1a"
          canvasProps={{ className: "h-40 w-full touch-none" }}
          onEnd={emitValue}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Sign above using your mouse or finger.</p>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
