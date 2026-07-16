"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  deleteAnnouncement,
  setAnnouncementPublished,
  updateAnnouncement,
} from "@boxing-gym/data-access";
import { announcementInputSchema } from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function createAnnouncementAction(formData: FormData): Promise<AdminActionResult> {
  const auth = await requireAdmin();

  const parsed = announcementInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid announcement." };
  }

  const supabase = await createClient();
  try {
    await createAnnouncement(supabase, { ...parsed.data, createdBy: auth.userId });
  } catch {
    return { success: false, error: "Could not create announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAnnouncementAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const announcementId = formData.get("announcementId");
  if (typeof announcementId !== "string" || announcementId.length === 0) {
    return { success: false, error: "Invalid announcement." };
  }

  const parsed = announcementInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid announcement." };
  }

  const supabase = await createClient();
  try {
    await updateAnnouncement(supabase, announcementId, parsed.data);
  } catch {
    return { success: false, error: "Could not update announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setAnnouncementPublishedAction(
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin();

  const announcementId = formData.get("announcementId");
  const isPublished = formData.get("isPublished") === "true";
  if (typeof announcementId !== "string" || announcementId.length === 0) {
    return { success: false, error: "Invalid announcement." };
  }

  const supabase = await createClient();
  try {
    await setAnnouncementPublished(supabase, announcementId, isPublished);
  } catch {
    return { success: false, error: "Could not update announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAnnouncementAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const announcementId = formData.get("announcementId");
  if (typeof announcementId !== "string" || announcementId.length === 0) {
    return { success: false, error: "Invalid announcement." };
  }

  const supabase = await createClient();
  try {
    await deleteAnnouncement(supabase, announcementId);
  } catch {
    return { success: false, error: "Could not delete announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
