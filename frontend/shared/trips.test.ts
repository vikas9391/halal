import { describe, expect, it } from "vitest";
import { getStatusCopy, matchesTripFilters } from "./trips";

describe("trip status presentation", () => {
  it("makes priority status explicit without promising a paid booking", () => {
    expect(getStatusCopy("priority_reservation")).toEqual({ label: "Priority reservation", tone: "brass" });
  });

  it("keeps unavailable trips in an action-safe waitlist state", () => {
    expect(getStatusCopy("waitlist").label).toBe("Join waitlist");
  });
});

describe("PTO-Smart filters", () => {
  const bosnia = { category: "world" as const, estimatedPtoDays: 4 };
  const umrah = { category: "umrah" as const, estimatedPtoDays: 4 };
  const longJourney = { category: "world" as const, estimatedPtoDays: 6 };

  it("returns a four-PTO-day global departure for the world filter", () => {
    expect(matchesTripFilters(bosnia, "world", true)).toBe(true);
  });

  it("does not make unspecified or longer PTO trips look PTO-Smart", () => {
    expect(matchesTripFilters(longJourney, "world", true)).toBe(false);
    expect(matchesTripFilters({ category: "world", estimatedPtoDays: null }, "world", true)).toBe(false);
  });

  it("keeps Umrah categories together for the sacred-journey filter", () => {
    expect(matchesTripFilters(umrah, "umrah", false)).toBe(true);
    expect(matchesTripFilters(bosnia, "umrah", false)).toBe(false);
  });
});
