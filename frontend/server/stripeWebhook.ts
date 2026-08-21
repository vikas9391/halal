import type { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe";
import * as db from "./db";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) return res.status(400).send("Missing Stripe signature");
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send("Stripe webhook is not configured");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = Number(session.metadata?.reservation_id);
    if (Number.isInteger(reservationId) && reservationId > 0) {
      await db.setReservationCheckoutSession(reservationId, session.id);
    }
  }

  console.log(`[Webhook] Received ${event.type} (${event.id})`);
  return res.json({ received: true });
}
