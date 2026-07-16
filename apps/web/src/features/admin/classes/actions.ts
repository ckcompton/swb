"use server";

import { revalidatePath } from "next/cache";
import {
  cancelClassSession,
  createClassSession,
  updateClassSession,
} from "@boxing-gym/data-access";
import { classSessionInputSchema } from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function createClassSessionAction(formData: FormData): Promise<AdminActionResult> {
  const auth = await requireAdmin();

  const parsed = classSessionInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    trainerId: emptyToNull(formData.get("trainerId")),
    startsAt: toIso(formData.get("startsAt")),
    endsAt: toIso(formData.get("endsAt")),
    capacity: Number(formData.get("capacity")),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid class." };
  }

  const supabase = await createClient();
  try {
    await createClassSession(supabase, {
      title: parsed.data.title,
      description: parsed.data.description || null,
      trainerId: parsed.data.trainerId,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      capacity: parsed.data.capacity,
      createdBy: auth.userId,
    });
  } catch {
    return { success: false, error: "Could not create class." };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

export async function updateClassSessionAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return { success: false, error: "Invalid class." };
  }

  const parsed = classSessionInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    trainerId: emptyToNull(formData.get("trainerId")),
    startsAt: toIso(formData.get("startsAt")),
    endsAt: toIso(formData.get("endsAt")),
    capacity: Number(formData.get("capacity")),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid class." };
  }

  const supabase = await createClient();
  try {
    await updateClassSession(supabase, sessionId, {
      title: parsed.data.title,
      description: parsed.data.description || null,
      trainerId: parsed.data.trainerId,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      capacity: parsed.data.capacity,
    });
  } catch {
    return { success: false, error: "Could not update class." };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

export async function cancelClassSessionAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return { success: false, error: "Invalid class." };
  }

  const supabase = await createClient();
  try {
    await cancelClassSession(supabase, sessionId);
  } catch {
    return { success: false, error: "Could not cancel class." };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

function toIso(value: FormDataEntryValue | null): string {
  if (!value || typeof value !== "string") return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}
