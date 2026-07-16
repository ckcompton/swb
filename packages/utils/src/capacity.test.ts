import { describe, expect, it } from "vitest";
import { capacityLabel, isAtCapacity, spotsRemaining } from "./capacity";

describe("spotsRemaining", () => {
  it("returns capacity minus booked count", () => {
    expect(spotsRemaining({ capacity: 10, bookedCount: 3 })).toBe(7);
  });

  it("never returns negative numbers", () => {
    expect(spotsRemaining({ capacity: 10, bookedCount: 15 })).toBe(0);
  });
});

describe("isAtCapacity", () => {
  it("returns false when spots remain", () => {
    expect(isAtCapacity({ capacity: 10, bookedCount: 9 })).toBe(false);
  });

  it("returns true when full or over", () => {
    expect(isAtCapacity({ capacity: 10, bookedCount: 10 })).toBe(true);
    expect(isAtCapacity({ capacity: 10, bookedCount: 11 })).toBe(true);
  });
});

describe("capacityLabel", () => {
  it("says Full when at or over capacity", () => {
    expect(capacityLabel({ capacity: 10, bookedCount: 10 })).toBe("Full");
  });

  it("uses singular for exactly one spot", () => {
    expect(capacityLabel({ capacity: 10, bookedCount: 9 })).toBe("1 spot left");
  });

  it("uses plural for multiple spots", () => {
    expect(capacityLabel({ capacity: 10, bookedCount: 5 })).toBe("5 spots left");
  });
});
