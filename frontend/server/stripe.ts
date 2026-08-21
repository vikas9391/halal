import Stripe from "stripe";
import { buildTripDepositLineItem } from "./products";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

type CheckoutInput = {
  trip: { id: number; title: string; depositCents: number; departureDate: Date | null };
  reservationId: number;
  email: string;
  name: string;
  userId?: number;
  origin: string;
};

export async function createDepositCheckout({ trip, reservationId, email, name, userId, origin }: CheckoutInput) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    allow_promotion_codes: true,
    line_items: [buildTripDepositLineItem(trip)],
    client_reference_id: userId ? String(userId) : undefined,
    metadata: {
      reservation_id: String(reservationId),
      user_id: userId ? String(userId) : "guest",
      customer_email: email,
      customer_name: name,
      trip_id: String(trip.id),
    },
    success_url: `${origin}/traveler?deposit=success&reservation=${reservationId}`,
    cancel_url: `${origin}/#departures`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session;
}

export async function getCheckoutPaymentSummary(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    created: session.created,
  };
}
