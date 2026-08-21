export const brand = {
  name: "Halal Tours",
  tagline: "Travel Grounded",
  location: "DFW based · Globally connected",
} as const;

export const tripStatuses = [
  "book_now",
  "priority_reservation",
  "waitlist",
  "coming_soon",
  "notify_me",
] as const;

export const reservationModes = ["interest", "priority_hold", "deposit", "full_payment"] as const;

export type TripStatus = (typeof tripStatuses)[number];
export type ReservationMode = (typeof reservationModes)[number];

export function getStatusCopy(status: TripStatus) {
  const labels: Record<TripStatus, { label: string; tone: string }> = {
    book_now: { label: "Book now", tone: "emerald" },
    priority_reservation: { label: "Priority reservation", tone: "brass" },
    waitlist: { label: "Join waitlist", tone: "ivory" },
    coming_soon: { label: "Coming soon", tone: "stone" },
    notify_me: { label: "Notify me", tone: "stone" },
  };
  return labels[status];
}

export function matchesTripFilters(
  trip: { category: "umrah" | "express_umrah" | "world"; estimatedPtoDays: number | null },
  filter: "all" | "umrah" | "world",
  ptoOnly: boolean,
) {
  const matchesCategory = filter === "all" || (filter === "umrah" ? trip.category !== "world" : trip.category === "world");
  const matchesPto = !ptoOnly || (trip.estimatedPtoDays ?? Number.POSITIVE_INFINITY) <= 4;
  return matchesCategory && matchesPto;
}
