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

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const waiverSignInputSchema = z
  .object({
    participantName: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(APP_LIMITS.waiverNameMaxLength),
    dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
    participantEmail: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    participantPhone: z.string().trim().min(1, "Phone number is required").max(30),
    address: z.string().trim().min(1, "Address is required").max(300),
    emergencyContactName: z
      .string()
      .trim()
      .min(1, "Emergency contact name is required")
      .max(APP_LIMITS.waiverNameMaxLength),
    emergencyContactRelationship: z.string().trim().min(1, "Relationship is required").max(100),
    emergencyContactPhone: z
      .string()
      .trim()
      .min(1, "Emergency contact phone number is required")
      .max(30),
    medicalConditions: z.string().trim().max(2000).default("None"),
    photoConsent: z.boolean(),
    isMinor: z.boolean(),
    guardianName: optionalTrimmedString(APP_LIMITS.waiverNameMaxLength),
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
