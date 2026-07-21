import { describe, expect, it } from "vitest";
import {
  canBookClass,
  canJoinWaitlist,
  hasCapacity,
  isClassBookable,
  isClassSessionValid,
} from "./booking";
import type { ClassSession, ClassSessionWithCounts } from "../types";

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: "c1",
    title: "Beginner Boxing",
    description: null,
    trainerId: null,
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-08-01T01:00:00.000Z",
    capacity: 10,
    status: "scheduled",
    allowsFreeTrial: false,
    createdBy: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeSessionWithCounts(
  overrides: Partial<ClassSessionWithCounts> = {},
): ClassSessionWithCounts {
  return {
    ...makeSession(),
    bookedCount: 0,
    waitlistCount: 0,
    trainer: null,
    ...overrides,
  };
}

const NOW = new Date("2026-07-16T12:00:00.000Z");

describe("isClassBookable", () => {
  it("returns false for canceled classes", () => {
    expect(isClassBookable(makeSession({ status: "canceled" }), NOW)).toBe(false);
  });

  it("returns false for classes that already started", () => {
    expect(isClassBookable(makeSession({ startsAt: "2026-01-01T00:00:00.000Z" }), NOW)).toBe(false);
  });

  it("returns true for future scheduled classes", () => {
    expect(isClassBookable(makeSession(), NOW)).toBe(true);
  });
});

describe("hasCapacity", () => {
  it("returns true when below capacity", () => {
    expect(hasCapacity(makeSessionWithCounts({ capacity: 10, bookedCount: 5 }))).toBe(true);
  });

  it("returns false when at or above capacity", () => {
    expect(hasCapacity(makeSessionWithCounts({ capacity: 10, bookedCount: 10 }))).toBe(false);
    expect(hasCapacity(makeSessionWithCounts({ capacity: 10, bookedCount: 11 }))).toBe(false);
  });
});

describe("canBookClass", () => {
  it("requires both bookable and capacity", () => {
    expect(canBookClass(makeSessionWithCounts({ capacity: 10, bookedCount: 10 }), NOW)).toBe(false);
    expect(
      canBookClass(
        makeSessionWithCounts({ status: "canceled", capacity: 10, bookedCount: 0 }),
        NOW,
      ),
    ).toBe(false);
    expect(canBookClass(makeSessionWithCounts({ capacity: 10, bookedCount: 9 }), NOW)).toBe(true);
  });
});

describe("canJoinWaitlist", () => {
  it("requires bookable but full", () => {
    expect(canJoinWaitlist(makeSessionWithCounts({ capacity: 10, bookedCount: 10 }), NOW)).toBe(
      true,
    );
    expect(canJoinWaitlist(makeSessionWithCounts({ capacity: 10, bookedCount: 9 }), NOW)).toBe(
      false,
    );
    expect(
      canJoinWaitlist(
        makeSessionWithCounts({ status: "canceled", capacity: 10, bookedCount: 10 }),
        NOW,
      ),
    ).toBe(false);
  });
});

describe("isClassSessionValid", () => {
  it("rejects zero or negative capacity", () => {
    expect(isClassSessionValid("2026-08-01T00:00:00.000Z", "2026-08-01T01:00:00.000Z", 0)).toBe(
      false,
    );
    expect(isClassSessionValid("2026-08-01T00:00:00.000Z", "2026-08-01T01:00:00.000Z", -1)).toBe(
      false,
    );
  });

  it("rejects end time not after start time", () => {
    expect(isClassSessionValid("2026-08-01T01:00:00.000Z", "2026-08-01T01:00:00.000Z", 10)).toBe(
      false,
    );
    expect(isClassSessionValid("2026-08-01T02:00:00.000Z", "2026-08-01T01:00:00.000Z", 10)).toBe(
      false,
    );
  });

  it("accepts valid session", () => {
    expect(isClassSessionValid("2026-08-01T00:00:00.000Z", "2026-08-01T01:00:00.000Z", 10)).toBe(
      true,
    );
  });
});
