import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as db from './db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe] Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe] Payment intent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).send('Webhook processing error');
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.user_id || '0');
  const packageId = session.metadata?.package_id || '';
  const tokensStr = session.metadata?.tokens || '0';
  const tokens = parseInt(tokensStr);

  if (!userId || !tokens) {
    console.error('[Stripe Webhook] Missing metadata in session:', session.id);
    return;
  }

  try {
    // Get current user balance
    const user = await db.getUserById(userId);
    if (!user) {
      console.error('[Stripe Webhook] User not found:', userId);
      return;
    }

    // Calculate new balance
    const currentBalance = parseFloat(user.tokenBalance.toString());
    const newBalance = (currentBalance + tokens).toString();

    // Update user token balance
    await db.updateUserTokenBalance(userId, newBalance);

    // Create transaction record
    await db.createTransaction(
      userId,
      'purchase',
      tokens.toString(),
      `Purchased ${tokens} tokens via Stripe`,
      session.payment_intent?.toString(),
      {
        packageId,
        sessionId: session.id,
        paymentMethod: session.payment_method_types?.[0],
      }
    );

    console.log('[Stripe Webhook] Successfully processed payment for user:', userId, 'Tokens:', tokens);
  } catch (error) {
    console.error('[Stripe Webhook] Error processing checkout session:', error);
    throw error;
  }
}
