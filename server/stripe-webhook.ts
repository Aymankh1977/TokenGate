import { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "./db";
import { usdToPico, picoToUsdString } from "./billing/billing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * IMPORTANT: Stripe signature verification needs the RAW request body, so this
 * route must be mounted with express.raw BEFORE any global express.json():
 *
 *   app.post("/api/stripe/webhook",
 *     express.raw({ type: "application/json" }),
 *     handleStripeWebhook);
 *   // ...then later: app.use(express.json())
 *
 * Fixes vs old build: idempotent (no double-credit on Stripe retries), atomic
 * credit via creditPurchaseIfNew, and removed the `evt_test_` short-circuit.
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.id, event.type, event.data.object as Stripe.Checkout.Session);
    } else {
      // Acknowledge everything else without side effects.
      console.log(`[Stripe] Ignored event type: ${event.type}`);
    }
    return res.json({ received: true });
  } catch (e) {
    console.error("[Stripe Webhook] Processing error:", e);
    return res.status(500).send("Webhook processing error");
  }
}

async function handleCheckoutCompleted(
  eventId: string,
  eventType: string,
  session: Stripe.Checkout.Session,
) {
  const userId = parseInt(session.metadata?.user_id || "0", 10);
  // grant_usd is set at checkout creation (price + any volume bonus).
  const grantUsd = parseFloat(session.metadata?.grant_usd || "0");
  const amountUsd = session.metadata?.amount_usd || grantUsd.toString();

  if (!userId || !(grantUsd > 0)) {
    console.error("[Stripe Webhook] Missing/invalid metadata on session:", session.id);
    return; // acknowledged; nothing to credit
  }

  const grantPico = usdToPico(grantUsd);
  const result = await db.creditPurchaseIfNew({
    eventId,
    eventType,
    userId,
    grantPico,
    amountUsd,
    stripePaymentId: session.payment_intent?.toString(),
    metadata: {
      sessionId: session.id,
      packageId: session.metadata?.package_id,
      grantUsd: picoToUsdString(grantPico),
    },
  });

  console.log(
    result.applied
      ? `[Stripe Webhook] Credited ${grantUsd} USD to user ${userId}`
      : `[Stripe Webhook] Duplicate event ${eventId} ignored`,
  );
}
