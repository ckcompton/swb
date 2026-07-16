export const ROLES = ["admin", "member"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = "member";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
