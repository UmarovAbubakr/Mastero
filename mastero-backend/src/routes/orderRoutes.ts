import { Router } from 'express';
import { createOrder, getWorkerOrders, getClientOrders, updateOrderStatus, rateOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     responses:
 *       201:
 *         description: Order created successfully
 *   get:
 *     summary: Get client orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of client orders
 */

/**
 * @swagger
 * /api/orders/worker:
 *   get:
 *     summary: Get worker orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of worker orders
 */

router.post('/', authMiddleware, createOrder);
router.get('/worker', authMiddleware, getWorkerOrders);
router.get('/client', authMiddleware, getClientOrders);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.post('/:id/rate', authMiddleware, rateOrder);

export default router;
