import { describe, expect, it } from "vitest";
import { isFuture, isPast, formatCalendarDate } from "./datetime";

const NOW = new Date("2026-07-16T12:00:00.000Z");

describe("isFuture", () => {
  it("returns true for a later timestamp", () => {
    expect(isFuture("2026-07-17T00:00:00.000Z", NOW)).toBe(true);
  });

  it("returns false for an earlier timestamp", () => {
    expect(isFuture("2026-07-15T00:00:00.000Z", NOW)).toBe(false);
  });
});

describe("isPast", () => {
  it("returns true for an earlier timestamp", () => {
    expect(isPast("2026-07-15T00:00:00.000Z", NOW)).toBe(true);
  });

  it("returns false for a later timestamp", () => {
    expect(isPast("2026-07-17T00:00:00.000Z", NOW)).toBe(false);
  });
});

describe("formatCalendarDate", () => {
  it("does not shift the date in a UTC-negative timezone", () => {
    // A naive `new Date("1995-01-01")` parses as UTC midnight, which rolls
    // back to Dec 31 once formatted in a timezone behind UTC -- this is the
    // bug formatCalendarDate exists to avoid for plain SQL `date` columns.
    expect(formatCalendarDate("1995-01-01")).toBe("Sun, Jan 1, 1995");
  });
});
