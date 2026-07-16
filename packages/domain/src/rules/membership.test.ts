import { describe, expect, it } from "vitest";
import { isMembershipActive, membershipStatusLabel } from "./membership";
import type { Membership } from "../types";

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "m1",
    profileId: "p1",
    planName: "Monthly Unlimited",
    status: "active",
    startsAt: "2020-01-01T00:00:00.000Z",
    endsAt: null,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const NOW = new Date("2026-07-16T12:00:00.000Z");

describe("isMembershipActive", () => {
  it("returns false when membership is null", () => {
    expect(isMembershipActive(null, NOW)).toBe(false);
  });

  it("returns false when status is not active", () => {
    expect(isMembershipActive(makeMembership({ status: "inactive" }), NOW)).toBe(false);
    expect(isMembershipActive(makeMembership({ status: "expired" }), NOW)).toBe(false);
  });

  it("returns false when membership has not started yet", () => {
    const membership = makeMembership({ startsAt: "2026-08-01T00:00:00.000Z" });
    expect(isMembershipActive(membership, NOW)).toBe(false);
  });

  it("returns false when membership has ended", () => {
    const membership = makeMembership({ endsAt: "2026-01-01T00:00:00.000Z" });
    expect(isMembershipActive(membership, NOW)).toBe(false);
  });

  it("returns true for an active membership with no end date", () => {
    expect(isMembershipActive(makeMembership(), NOW)).toBe(true);
  });

  it("returns true for an active membership with a future end date", () => {
    const membership = makeMembership({ endsAt: "2027-01-01T00:00:00.000Z" });
    expect(isMembershipActive(membership, NOW)).toBe(true);
  });
});

describe("membershipStatusLabel", () => {
  it("labels null membership", () => {
    expect(membershipStatusLabel(null)).toBe("No membership");
  });

  it("labels each status", () => {
    expect(membershipStatusLabel(makeMembership({ status: "active" }))).toBe("Active");
    expect(membershipStatusLabel(makeMembership({ status: "inactive" }))).toBe("Inactive");
    expect(membershipStatusLabel(makeMembership({ status: "expired" }))).toBe("Expired");
  });
});
