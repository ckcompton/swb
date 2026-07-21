export const APP_LIMITS = {
  minClassCapacity: 1,
  maxClassCapacity: 200,
  trainerBioMaxLength: 2000,
  announcementBodyMaxLength: 5000,
  announcementTitleMaxLength: 200,
  classTitleMaxLength: 150,
  classDescriptionMaxLength: 2000,
  maxRecurringOccurrences: 52,
  trainerPhotoMaxSizeBytes: 5 * 1024 * 1024,
  trainerPhotoAllowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  trialRequestNameMaxLength: 100,
  trialRequestPhoneMaxLength: 30,
  trialRequestMessageMaxLength: 1000,
  trialRequestResubmitWindowMinutes: 60,
} as const;

export const TRAINER_PHOTOS_BUCKET = "trainer-photos";
