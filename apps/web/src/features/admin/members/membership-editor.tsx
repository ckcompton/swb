"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MEMBERSHIP_STATUSES } from "@boxing-gym/config";
import type { Membership } from "@boxing-gym/domain";
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
import {
  createMembershipAction,
  updateMembershipStatusAction,
} from "@/features/admin/members/actions";

export function MembershipEditor({
  profileId,
  memberName,
  membership,
}: {
  profileId: string;
  memberName: string;
  membership: Membership | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [planName, setPlanName] = useState(membership?.planName ?? "Monthly Unlimited");
  const [status, setStatus] = useState(membership?.status ?? "active");

  const onSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      let result;
      if (membership) {
        formData.set("membershipId", membership.id);
        formData.set("status", status);
        result = await updateMembershipStatusAction(formData);
      } else {
        formData.set("profileId", profileId);
        formData.set("planName", planName);
        formData.set("status", status);
        formData.set("startsAt", new Date().toISOString().slice(0, 10));
        result = await createMembershipAction(formData);
      }

      if (result.success) {
        toast.success("Membership updated.");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            {membership ? "Edit membership" : "Add membership"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{membership ? "Edit membership" : "Add membership"}</DialogTitle>
          <DialogDescription>For {memberName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!membership && (
            <div className="space-y-2">
              <Label htmlFor="planName">Plan name</Label>
              <Input id="planName" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBERSHIP_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
