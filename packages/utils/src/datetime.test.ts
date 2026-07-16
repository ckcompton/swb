import { describe, expect, it } from "vitest";
import { isFuture, isPast } from "./datetime";

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
