"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Announcement } from "@boxing-gym/domain";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/features/admin/announcements/actions";

export function AnnouncementForm({
  announcement,
  trigger,
}: {
  announcement?: Announcement;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = announcement
        ? await (async () => {
            formData.set("announcementId", announcement.id);
            return updateAnnouncementAction(formData);
          })()
        : await createAnnouncementAction(formData);

      if (result.success) {
        toast.success(announcement ? "Announcement updated." : "Announcement created.");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>
            {announcement
              ? "Update this announcement."
              : "New announcements start unpublished. Publish when ready."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={announcement?.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" name="body" defaultValue={announcement?.body} rows={5} required />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
