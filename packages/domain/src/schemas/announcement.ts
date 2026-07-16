import { z } from "zod";
import { APP_LIMITS } from "@boxing-gym/config";

export const announcementInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(APP_LIMITS.announcementTitleMaxLength),
  body: z.string().trim().min(1, "Body is required").max(APP_LIMITS.announcementBodyMaxLength),
});
export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
