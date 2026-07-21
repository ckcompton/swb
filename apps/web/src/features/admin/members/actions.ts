"use server";

import { revalidatePath } from "next/cache";
import { createMembership, updateMembership } from "@boxing-gym/data-access";
import { membershipInputSchema, updateMembershipStatusSchema } from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function createMembershipAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const endsAtRaw = formData.get("endsAt");
  const parsed = membershipInputSchema.safeParse({
    profileId: formData.get("profileId"),
    planName: formData.get("planName"),
    status: formData.get("status"),
    startsAt: toIso(formData.get("startsAt")),
    endsAt: endsAtRaw ? toIso(endsAtRaw) : null,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid membership." };
  }

  const supabase = await createClient();
  try {
    await createMembership(supabase, parsed.data);
  } catch {
    return { success: false, error: "Could not create membership." };
  }

  revalidatePath("/admin/members");
  return { success: true };
}

export async function updateMembershipStatusAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = updateMembershipStatusSchema.safeParse({
    membershipId: formData.get("membershipId"),
    status: formData.get("status"),
    planName: formData.get("planName") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  const supabase = await createClient();
  try {
    await updateMembership(supabase, parsed.data.membershipId, {
      status: parsed.data.status,
      planName: parsed.data.planName,
    });
  } catch {
    return { success: false, error: "Could not update membership." };
  }

  revalidatePath("/admin/members");
  return { success: true };
}

function toIso(value: FormDataEntryValue | null): string {
  if (!value || typeof value !== "string") return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
