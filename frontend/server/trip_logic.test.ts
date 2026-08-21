import { describe, expect, it } from "vitest";
import { reservationInputSchema } from "../shared/reservation";
import { getStatusCopy, matchesTripFilters } from "../shared/trips";

describe("PTO-Smart trip logic", () => {
  it("keeps a four-PTO-day global departure in the fast-escape filter", () => {
    expect(matchesTripFilters({ category: "world", estimatedPtoDays: 4 }, "world", true)).toBe(true);
  });

  it("does not label unscheduled or high-PTO departures as PTO-Smart", () => {
    expect(matchesTripFilters({ category: "world", estimatedPtoDays: null }, "world", true)).toBe(false);
    expect(matchesTripFilters({ category: "world", estimatedPtoDays: 5 }, "world", true)).toBe(false);
  });

  it("uses an action-safe status label for priority departures", () => {
    expect(getStatusCopy("priority_reservation")).toEqual({ label: "Priority reservation", tone: "brass" });
  });
});

describe("reservation input validation", () => {
  const validReservation = { tripId: 1, primaryName: "Amina Noor", email: "amina@example.com", phone: "+1 214 555 0100", adults: 2, children: 1, addUmrahExtension: false };

  it("accepts a complete family reservation request", () => {
    expect(reservationInputSchema.safeParse(validReservation).success).toBe(true);
  });

  it("rejects incomplete contact details and an invalid party size", () => {
    expect(reservationInputSchema.safeParse({ ...validReservation, email: "not-an-email" }).success).toBe(false);
    expect(reservationInputSchema.safeParse({ ...validReservation, adults: 0 }).success).toBe(false);
  });
});
