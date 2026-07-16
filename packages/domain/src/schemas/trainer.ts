import { z } from "zod";
import { APP_LIMITS } from "@boxing-gym/config";

export const trainerInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  bio: z.string().trim().max(APP_LIMITS.trainerBioMaxLength).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});
export type TrainerInput = z.infer<typeof trainerInputSchema>;

export const trainerPhotoSchema = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.enum(APP_LIMITS.trainerPhotoAllowedMimeTypes),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(APP_LIMITS.trainerPhotoMaxSizeBytes, "File is too large"),
});
export type TrainerPhotoInput = z.infer<typeof trainerPhotoSchema>;
