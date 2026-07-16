import type { SupabaseClient } from "@supabase/supabase-js";
import { TRAINER_PHOTOS_BUCKET } from "@boxing-gym/config";
import type { Database } from "../database.types";

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

export function buildTrainerPhotoPath(trainerId: string, contentType: string): string {
  const ext = extensionForContentType(contentType);
  return `${trainerId}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadTrainerPhoto(
  client: SupabaseClient<Database>,
  path: string,
  file: Blob | ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const { error } = await client.storage
    .from(TRAINER_PHOTOS_BUCKET)
    .upload(path, file, { contentType, upsert: true });
  if (error) throw error;
}

export async function deleteTrainerPhoto(
  client: SupabaseClient<Database>,
  path: string,
): Promise<void> {
  const { error } = await client.storage.from(TRAINER_PHOTOS_BUCKET).remove([path]);
  if (error) throw error;
}

export function getTrainerPhotoPublicUrl(client: SupabaseClient<Database>, path: string): string {
  const { data } = client.storage.from(TRAINER_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
