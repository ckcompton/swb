"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Trainer } from "@boxing-gym/domain";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createTrainerAction,
  removeTrainerPhotoAction,
  updateTrainerAction,
} from "@/features/admin/trainers/actions";

export function TrainerForm({
  trainer,
  photoUrl,
  trigger,
}: {
  trainer?: Trainer;
  photoUrl?: string | null;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(trainer?.isActive ?? true);

  const onSubmit = (formData: FormData) => {
    formData.set("isActive", isActive ? "true" : "false");
    startTransition(async () => {
      const result = trainer
        ? await (async () => {
            formData.set("trainerId", trainer.id);
            return updateTrainerAction(formData);
          })()
        : await createTrainerAction(formData);

      if (result.success) {
        toast.success(trainer ? "Trainer updated." : "Trainer created.");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  const onRemovePhoto = () => {
    if (!trainer?.photoPath) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("trainerId", trainer.id);
      formData.set("photoPath", trainer.photoPath!);
      const result = await removeTrainerPhotoAction(formData);
      if (result.success) {
        toast.success("Photo removed.");
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
          <DialogTitle>{trainer ? "Edit trainer" : "New trainer"}</DialogTitle>
          <DialogDescription>
            {trainer ? "Update trainer details." : "Add a new trainer to the roster."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={trainer?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={trainer?.bio ?? ""} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            {photoUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={trainer?.name}
                  className="size-16 rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemovePhoto}
                  disabled={isPending}
                >
                  Remove photo
                </Button>
              </div>
            )}
            <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Active</Label>
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
