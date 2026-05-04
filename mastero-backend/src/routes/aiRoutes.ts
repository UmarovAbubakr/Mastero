import express from 'express';
import { chatWithAI } from '../controllers/aiController';

const router = express.Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI Assistant for worker recommendations
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', chatWithAI);

export default router;
