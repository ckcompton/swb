export const MEMBERSHIP_STATUSES = ["active", "inactive", "expired"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const BOOKING_STATUSES = ["booked", "canceled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const CLASS_SESSION_STATUSES = ["scheduled", "canceled"] as const;
export type ClassSessionStatus = (typeof CLASS_SESSION_STATUSES)[number];

export const TRIAL_REQUEST_STATUSES = [
  "pending",
  "contacted",
  "approved",
  "declined",
  "completed",
] as const;
export type TrialRequestStatus = (typeof TRIAL_REQUEST_STATUSES)[number];

export const TRIAL_EXPERIENCE_LEVELS = ["none", "beginner", "intermediate", "advanced"] as const;
export type TrialExperienceLevel = (typeof TRIAL_EXPERIENCE_LEVELS)[number];

export const WAITLIST_STATUSES = ["waiting", "promoted", "left"] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];
