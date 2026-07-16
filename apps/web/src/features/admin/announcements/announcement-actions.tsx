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
import {
  deleteAnnouncementAction,
  setAnnouncementPublishedAction,
} from "@/features/admin/announcements/actions";

export function PublishToggleButton({
  announcementId,
  isPublished,
}: {
  announcementId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("announcementId", announcementId);
      formData.set("isPublished", (!isPublished).toString());
      const result = await setAnnouncementPublishedAction(formData);
      if (result.success) {
        toast.success(isPublished ? "Announcement unpublished." : "Announcement published.");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={onClick} disabled={isPending}>
      {isPending ? "Saving…" : isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}

export function DeleteAnnouncementButton({
  announcementId,
  title,
}: {
  announcementId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onConfirm = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("announcementId", announcementId);
      const result = await deleteAnnouncementAction(formData);
      if (result.success) {
        toast.success("Announcement deleted.");
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
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{title}&quot;. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
