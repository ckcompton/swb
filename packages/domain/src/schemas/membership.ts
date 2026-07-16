import { z } from "zod";
import { MEMBERSHIP_STATUSES } from "@boxing-gym/config";

export const membershipInputSchema = z.object({
  profileId: z.string().uuid(),
  planName: z.string().trim().min(1, "Plan name is required").max(150),
  status: z.enum(MEMBERSHIP_STATUSES),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
});
export type MembershipInput = z.infer<typeof membershipInputSchema>;

export const updateMembershipStatusSchema = z.object({
  membershipId: z.string().uuid(),
  status: z.enum(MEMBERSHIP_STATUSES),
});
export type UpdateMembershipStatusInput = z.infer<typeof updateMembershipStatusSchema>;
