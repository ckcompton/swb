import type { Membership } from "../types";

export function isMembershipActive(membership: Membership | null, now: Date = new Date()): boolean {
  if (!membership) return false;
  if (membership.status !== "active") return false;
  if (new Date(membership.startsAt).getTime() > now.getTime()) return false;
  if (membership.endsAt && new Date(membership.endsAt).getTime() < now.getTime()) return false;
  return true;
}

export function membershipStatusLabel(membership: Membership | null): string {
  if (!membership) return "No membership";
  switch (membership.status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "expired":
      return "Expired";
    default:
      return "Unknown";
  }
}
