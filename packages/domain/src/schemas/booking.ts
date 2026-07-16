import { z } from "zod";

export const createBookingSchema = z.object({
  classSessionId: z.string().uuid(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const joinWaitlistSchema = z.object({
  classSessionId: z.string().uuid(),
});
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

export const leaveWaitlistSchema = z.object({
  waitlistEntryId: z.string().uuid(),
});
export type LeaveWaitlistInput = z.infer<typeof leaveWaitlistSchema>;
