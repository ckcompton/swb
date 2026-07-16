import { describe, expect, it } from "vitest";
import { formatDisplayName, formatInitials, initialsFromFullName } from "./names";

describe("formatDisplayName", () => {
  it("joins first and last name", () => {
    expect(formatDisplayName("Jane", "Doe")).toBe("Jane Doe");
  });

  it("falls back when both names are missing", () => {
    expect(formatDisplayName(null, undefined)).toBe("Unnamed member");
  });

  it("uses whichever name is present", () => {
    expect(formatDisplayName("Jane", null)).toBe("Jane");
    expect(formatDisplayName(undefined, "Doe")).toBe("Doe");
  });
});

describe("formatInitials", () => {
  it("returns uppercase initials", () => {
    expect(formatInitials("jane", "doe")).toBe("JD");
  });

  it("falls back to ? when both are missing", () => {
    expect(formatInitials(null, undefined)).toBe("?");
  });
});

describe("initialsFromFullName", () => {
  it("splits a full name into initials", () => {
    expect(initialsFromFullName("Marcus Reyes")).toBe("MR");
  });

  it("handles a single-word name", () => {
    expect(initialsFromFullName("Madonna")).toBe("M");
  });
});
