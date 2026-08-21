export function buildTripDepositLineItem(trip: { title: string; depositCents: number; departureDate: Date | null }) {
  const departure = trip.departureDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(trip.departureDate)
    : "departure to be confirmed";

  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: `${trip.title} deposit`,
        description: `Secure deposit for ${trip.title} · ${departure}`,
      },
      unit_amount: trip.depositCents,
    },
    quantity: 1,
  } as const;
}
