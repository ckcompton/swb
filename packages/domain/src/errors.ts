export const WAIVER_ERROR_CODES = [
  "GUARDIAN_NAME_REQUIRED",
  "NOT_AUTHENTICATED",
  "UNKNOWN_ERROR",
] as const;

export type WaiverErrorCode = (typeof WAIVER_ERROR_CODES)[number];

export class WaiverError extends Error {
  readonly code: WaiverErrorCode;

  constructor(code: WaiverErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "WaiverError";
  }
}

const WAIVER_ERROR_MESSAGES: Record<WaiverErrorCode, string> = {
  GUARDIAN_NAME_REQUIRED: "Parent/guardian name is required for a minor participant.",
  NOT_AUTHENTICATED: "Please log in to continue.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

export function friendlyWaiverErrorMessage(code: string): string {
  if ((WAIVER_ERROR_CODES as readonly string[]).includes(code)) {
    return WAIVER_ERROR_MESSAGES[code as WaiverErrorCode];
  }
  return WAIVER_ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function mapPostgresErrorToWaiverErrorCode(pgMessage: string): WaiverErrorCode {
  const normalized = pgMessage.toUpperCase();
  const match = WAIVER_ERROR_CODES.find((code) => normalized.includes(code));
  return match ?? "UNKNOWN_ERROR";
}
