export const BOOKING_ERROR_CODES = [
  "CLASS_NOT_FOUND",
  "CLASS_FULL",
  "ALREADY_BOOKED",
  "MEMBERSHIP_INACTIVE",
  "CLASS_NOT_BOOKABLE",
  "BOOKING_NOT_FOUND",
  "NOT_AUTHENTICATED",
  "CLASS_NOT_FULL",
  "ALREADY_WAITLISTED",
  "WAITLIST_ENTRY_NOT_FOUND",
  "UNKNOWN_ERROR",
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number];

export class BookingError extends Error {
  readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "BookingError";
  }
}

const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  CLASS_NOT_FOUND: "This class could not be found.",
  CLASS_FULL: "This class is full. Please choose another session.",
  ALREADY_BOOKED: "You already have a booking for this class.",
  MEMBERSHIP_INACTIVE: "Your membership is not active. Contact the front desk to book classes.",
  CLASS_NOT_BOOKABLE: "This class is no longer available to book.",
  BOOKING_NOT_FOUND: "We couldn't find that booking.",
  NOT_AUTHENTICATED: "Please log in to continue.",
  CLASS_NOT_FULL: "This class still has open spots. Please book directly instead.",
  ALREADY_WAITLISTED: "You're already on the waitlist for this class.",
  WAITLIST_ENTRY_NOT_FOUND: "We couldn't find that waitlist entry.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

export function friendlyBookingErrorMessage(code: string): string {
  if ((BOOKING_ERROR_CODES as readonly string[]).includes(code)) {
    return BOOKING_ERROR_MESSAGES[code as BookingErrorCode];
  }
  return BOOKING_ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function mapPostgresErrorToBookingErrorCode(pgMessage: string): BookingErrorCode {
  const normalized = pgMessage.toUpperCase();
  const match = BOOKING_ERROR_CODES.find((code) => normalized.includes(code));
  return match ?? "UNKNOWN_ERROR";
}
