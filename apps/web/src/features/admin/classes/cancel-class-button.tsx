"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelClassSessionAction } from "@/features/admin/classes/actions";

export function CancelClassButton({
  sessionId,
  title,
  isPartOfSeries,
}: {
  sessionId: string;
  title: string;
  isPartOfSeries?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      const result = await cancelClassSessionAction(formData);
      if (result.success) {
        toast.success("Class canceled.");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" variant="outline">
            Cancel class
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this class?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel &quot;{title}&quot;. Existing bookings remain visible to members but
            the class will be marked canceled and can no longer be booked.
            {isPartOfSeries &&
              " This class is part of a weekly series -- only this occurrence is affected, other classes in the series stay scheduled."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep class</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Canceling…" : "Cancel class"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
