import { getTrainerPhotoPublicUrl } from "@boxing-gym/data-access";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@boxing-gym/data-access";

export function trainerPhotoUrl(
  client: SupabaseClient<Database>,
  photoPath: string | null,
): string | null {
  if (!photoPath) return null;
  return getTrainerPhotoPublicUrl(client, photoPath);
}
