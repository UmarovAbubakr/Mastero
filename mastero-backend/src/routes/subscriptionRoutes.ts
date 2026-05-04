import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSubscriptionStatus,
  createCheckoutSession,
  handleWebhook
} from '../controllers/subscriptionController';
import express from 'express';

const router = Router();

/**
 * @swagger
 * /api/subscriptions/status:
 *   get:
 *     summary: Get current subscription status
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status
 */
router.get('/status', authMiddleware, getSubscriptionStatus);

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [PRO, ULTRA]
 *     responses:
 *       200:
 *         description: Checkout session created
 */
router.post('/checkout', authMiddleware, createCheckoutSession);

// Webhook needs raw body, handled in index.ts for specifically this route usually, 
// but we can also define it here and use a specific parser in index.ts
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
