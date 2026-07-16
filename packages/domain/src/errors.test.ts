import { describe, expect, it } from "vitest";
import { friendlyBookingErrorMessage, mapPostgresErrorToBookingErrorCode } from "./errors";

describe("friendlyBookingErrorMessage", () => {
  it("maps known codes to friendly text", () => {
    expect(friendlyBookingErrorMessage("CLASS_FULL")).toMatch(/full/i);
    expect(friendlyBookingErrorMessage("ALREADY_BOOKED")).toMatch(/already/i);
    expect(friendlyBookingErrorMessage("MEMBERSHIP_INACTIVE")).toMatch(/membership/i);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(friendlyBookingErrorMessage("SOMETHING_WEIRD")).toMatch(/wrong/i);
  });
});

describe("mapPostgresErrorToBookingErrorCode", () => {
  it("extracts known error codes from a postgres error message", () => {
    expect(mapPostgresErrorToBookingErrorCode("ERROR: CLASS_FULL")).toBe("CLASS_FULL");
    expect(mapPostgresErrorToBookingErrorCode("already_booked constraint violated")).toBe(
      "ALREADY_BOOKED",
    );
  });

  it("returns UNKNOWN_ERROR for unrecognized messages", () => {
    expect(mapPostgresErrorToBookingErrorCode("some unrelated db failure")).toBe("UNKNOWN_ERROR");
  });
});
