import { z } from "zod";
import { APP_LIMITS } from "@boxing-gym/config";

// Data URL produced by the signature canvas's toDataURL("image/png") -- the
// Server Action strips the "data:image/png;base64," prefix before decoding
// and uploading the raw bytes to storage.
const signatureDataUrlSchema = z
  .string()
  .trim()
  .startsWith("data:image/png;base64,", "Please provide a signature")
  .max(Math.ceil((APP_LIMITS.waiverSignatureMaxSizeBytes * 4) / 3) + 32);

export const waiverSignInputSchema = z
  .object({
    participantName: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(APP_LIMITS.waiverNameMaxLength),
    participantEmail: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    participantPhone: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    isMinor: z.boolean(),
    guardianName: z
      .string()
      .trim()
      .max(APP_LIMITS.waiverNameMaxLength)
      .nullable()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    signatureDataUrl: signatureDataUrlSchema,
    agreedToTerms: z.literal(true, {
      error: "You must agree to the terms before signing",
    }),
    waiverVersion: z.string().trim().min(1),
  })
  .refine((value) => !value.isMinor || Boolean(value.guardianName), {
    message: "Parent/guardian name is required when the participant is a minor",
    path: ["guardianName"],
  });
export type WaiverSignInput = z.input<typeof waiverSignInputSchema>;
export type WaiverSignOutput = z.output<typeof waiverSignInputSchema>;
