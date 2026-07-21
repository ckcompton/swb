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
import { resetWaiverAction } from "@/features/admin/members/actions";

export function ResetWaiverButton({
  profileId,
  memberName,
}: {
  profileId: string;
  memberName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("profileId", profileId);
      const result = await resetWaiverAction(formData);
      if (result.success) {
        toast.success("Waiver reset.");
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
            Reset
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset {memberName}&apos;s waiver?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes their signed waiver record. They&apos;ll be required to read and sign the
            liability waiver again before booking another class.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Resetting…" : "Reset waiver"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
