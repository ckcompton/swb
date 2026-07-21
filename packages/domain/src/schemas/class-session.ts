import { z } from "zod";
import { APP_LIMITS, CLASS_SESSION_STATUSES } from "@boxing-gym/config";

export const classSessionInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(APP_LIMITS.classTitleMaxLength),
    description: z
      .string()
      .trim()
      .max(APP_LIMITS.classDescriptionMaxLength)
      .optional()
      .or(z.literal("")),
    trainerId: z.string().uuid().nullable().optional(),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    capacity: z
      .number()
      .int()
      .min(APP_LIMITS.minClassCapacity, "Capacity must be greater than zero")
      .max(APP_LIMITS.maxClassCapacity),
    allowsFreeTrial: z.boolean().optional(),
    occurrenceCount: z.coerce
      .number()
      .int()
      .min(1)
      .max(APP_LIMITS.maxRecurringOccurrences)
      .optional(),
  })
  .refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
    message: "End time must be after start time",
    path: ["endsAt"],
  });
export type ClassSessionInput = z.infer<typeof classSessionInputSchema>;

export const classSessionStatusSchema = z.enum(CLASS_SESSION_STATUSES);
