export const CLASS_SESSION_STATUSES = ["scheduled", "canceled"] as const;
export type ClassSessionStatus = (typeof CLASS_SESSION_STATUSES)[number];
