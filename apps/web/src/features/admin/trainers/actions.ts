"use server";

import { revalidatePath } from "next/cache";
import {
  buildTrainerPhotoPath,
  createTrainer,
  deleteTrainerPhoto,
  updateTrainer,
  uploadTrainerPhoto,
} from "@boxing-gym/data-access";
import { trainerInputSchema, trainerPhotoSchema } from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function createTrainerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = trainerInputSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid trainer." };
  }

  const supabase = await createClient();
  let trainer;
  try {
    trainer = await createTrainer(supabase, {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      isActive: parsed.data.isActive,
    });
  } catch {
    return { success: false, error: "Could not create trainer." };
  }

  const photoResult = await maybeUploadPhoto(formData, trainer.id);
  if (!photoResult.success) {
    return photoResult;
  }

  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
  return { success: true };
}

export async function updateTrainerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const trainerId = formData.get("trainerId");
  if (typeof trainerId !== "string" || trainerId.length === 0) {
    return { success: false, error: "Invalid trainer." };
  }

  const parsed = trainerInputSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid trainer." };
  }

  const supabase = await createClient();
  try {
    await updateTrainer(supabase, trainerId, {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      isActive: parsed.data.isActive,
    });
  } catch {
    return { success: false, error: "Could not update trainer." };
  }

  const photoResult = await maybeUploadPhoto(formData, trainerId);
  if (!photoResult.success) {
    return photoResult;
  }

  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
  return { success: true };
}

async function maybeUploadPhoto(formData: FormData, trainerId: string): Promise<AdminActionResult> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: true };
  }

  const parsed = trainerPhotoSchema.safeParse({
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid photo." };
  }

  const supabase = await createClient();
  const path = buildTrainerPhotoPath(trainerId, parsed.data.contentType);

  try {
    const buffer = await file.arrayBuffer();
    await uploadTrainerPhoto(supabase, path, buffer, parsed.data.contentType);
    await updateTrainer(supabase, trainerId, { photoPath: path });
  } catch {
    return { success: false, error: "Could not upload photo." };
  }

  return { success: true };
}

export async function removeTrainerPhotoAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();

  const trainerId = formData.get("trainerId");
  const photoPath = formData.get("photoPath");
  if (typeof trainerId !== "string" || typeof photoPath !== "string") {
    return { success: false, error: "Invalid request." };
  }

  const supabase = await createClient();
  try {
    await deleteTrainerPhoto(supabase, photoPath);
    await updateTrainer(supabase, trainerId, { photoPath: null });
  } catch {
    return { success: false, error: "Could not remove photo." };
  }

  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
  return { success: true };
}
