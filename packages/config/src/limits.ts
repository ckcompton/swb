export const APP_LIMITS = {
  trainerBioMaxLength: 2000,
  trainerPhotoMaxSizeBytes: 5 * 1024 * 1024,
  trainerPhotoAllowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  waiverNameMaxLength: 150,
  waiverSignatureMaxSizeBytes: 1024 * 1024,
} as const;

export const TRAINER_PHOTOS_BUCKET = "trainer-photos";
export const WAIVER_SIGNATURES_BUCKET = "waiver-signatures";

// Bump when the waiver's legal text changes. Existing signed waivers are not
// invalidated automatically -- see plan doc for the re-sign-on-version-change
// follow-up.
export const WAIVER_VERSION = "v2";

// Resend's free-tier daily send cap. Used only to render "N / 100 sent
// today" on the admin overview -- update if the account moves to a paid
// plan with a different (or no) daily limit.
export const RESEND_DAILY_EMAIL_LIMIT = 100;
