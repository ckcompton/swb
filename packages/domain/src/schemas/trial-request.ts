import { z } from "zod";
import { APP_LIMITS, TRIAL_EXPERIENCE_LEVELS, TRIAL_REQUEST_STATUSES } from "@boxing-gym/config";

export const trialExperienceLevelSchema = z.enum(TRIAL_EXPERIENCE_LEVELS);
export const trialRequestStatusSchema = z.enum(TRIAL_REQUEST_STATUSES);

// `honeypot` is a hidden form field real users never see or fill in - bots
// that blindly fill every input trip it. Any non-empty value fails
// validation silently (see createTrialRequestAction), without revealing to
// the caller that a honeypot check exists.
export const trialRequestInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(APP_LIMITS.trialRequestNameMaxLength),
  lastName: z.string().trim().min(1, "Last name is required").max(APP_LIMITS.trialRequestNameMaxLength),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(APP_LIMITS.trialRequestPhoneMaxLength),
  classSessionId: z.string().uuid("Choose a class"),
  experienceLevel: trialExperienceLevelSchema,
  message: z
    .string()
    .trim()
    .max(APP_LIMITS.trialRequestMessageMaxLength)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  honeypot: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? ""),
});
export type TrialRequestInput = z.infer<typeof trialRequestInputSchema>;

export const updateTrialRequestStatusSchema = z.object({
  trialRequestId: z.string().uuid(),
  status: trialRequestStatusSchema,
});
export type UpdateTrialRequestStatusInput = z.infer<typeof updateTrialRequestStatusSchema>;

export const updateTrialRequestNotesSchema = z.object({
  trialRequestId: z.string().uuid(),
  adminNotes: z
    .string()
    .trim()
    .max(APP_LIMITS.trialRequestMessageMaxLength)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});
export type UpdateTrialRequestNotesInput = z.infer<typeof updateTrialRequestNotesSchema>;
