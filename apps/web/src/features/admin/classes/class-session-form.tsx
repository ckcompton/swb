"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClassSession, Trainer } from "@boxing-gym/domain";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createClassSessionAction,
  updateClassSessionAction,
} from "@/features/admin/classes/actions";

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function ClassSessionForm({
  session,
  trainers,
  trigger,
}: {
  session?: ClassSession;
  trainers: Trainer[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [trainerId, setTrainerId] = useState(session?.trainerId ?? "none");

  const onSubmit = (formData: FormData) => {
    if (trainerId !== "none") {
      formData.set("trainerId", trainerId);
    }
    startTransition(async () => {
      const result = session
        ? await (async () => {
            formData.set("sessionId", session.id);
            return updateClassSessionAction(formData);
          })()
        : await createClassSessionAction(formData);

      if (result.success) {
        toast.success(session ? "Class updated." : "Class created.");
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
          <DialogTitle>{session ? "Edit class" : "New class"}</DialogTitle>
          <DialogDescription>
            {session ? "Update this class session." : "Schedule a new class session."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={session?.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={session?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainerId">Trainer</Label>
            <Select value={trainerId} onValueChange={(v) => setTrainerId(v ?? "none")}>
              <SelectTrigger id="trainerId" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === "none" || !value
                      ? "No trainer"
                      : (trainers.find((trainer) => trainer.id === value)?.name ?? "No trainer")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No trainer</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts at</Label>
              <Input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                defaultValue={toLocalInputValue(session?.startsAt)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Ends at</Label>
              <Input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                defaultValue={toLocalInputValue(session?.endsAt)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              max={200}
              defaultValue={session?.capacity ?? 12}
              required
            />
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
