import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  const { tier } = req.body; // "PRO" or "ULTRA"

  if (!['PRO', 'ULTRA'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  const prices: Record<string, number> = {
    PRO: 1000, // $10.00
    ULTRA: 2500, // $25.00
  };

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // In a real app, you'd use Stripe Prices. For simplicity, we'll use inline items.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mastero ${tier} Subscription`,
              description: `Upgrade your account to ${tier} status.`,
            },
            unit_amount: prices[tier],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        tier: tier,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req: any, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (userId && tier) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      await prisma.transaction.create({
        data: {
          userId,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'completed',
          stripeId: session.id,
          tier: tier as string,
        },
      });
    }
  }

  res.json({ received: true });
};
