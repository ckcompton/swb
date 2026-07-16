"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bookClassAction } from "@/features/bookings/actions";

export function BookClassButton({
  classSessionId,
  disabled,
  disabledLabel,
}: {
  classSessionId: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("classSessionId", classSessionId);
      const result = await bookClassAction(formData);
      if (result.success) {
        toast.success("Class booked.");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  if (disabled) {
    return (
      <Button size="sm" disabled>
        {disabledLabel ?? "Unavailable"}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={onClick} disabled={isPending}>
      {isPending ? "Booking…" : "Book"}
    </Button>
  );
}
