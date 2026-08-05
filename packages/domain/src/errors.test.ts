import { describe, expect, it } from "vitest";
import { friendlyWaiverErrorMessage, mapPostgresErrorToWaiverErrorCode } from "./errors";

describe("friendlyWaiverErrorMessage", () => {
  it("maps known codes to friendly text", () => {
    expect(friendlyWaiverErrorMessage("GUARDIAN_NAME_REQUIRED")).toMatch(/guardian/i);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(friendlyWaiverErrorMessage("SOMETHING_WEIRD")).toMatch(/wrong/i);
  });
});

describe("mapPostgresErrorToWaiverErrorCode", () => {
  it("extracts known error codes from a postgres error message", () => {
    expect(mapPostgresErrorToWaiverErrorCode("ERROR: GUARDIAN_NAME_REQUIRED")).toBe(
      "GUARDIAN_NAME_REQUIRED",
    );
  });

  it("returns UNKNOWN_ERROR for unrecognized messages", () => {
    expect(mapPostgresErrorToWaiverErrorCode("some unrelated db failure")).toBe("UNKNOWN_ERROR");
  });
});
