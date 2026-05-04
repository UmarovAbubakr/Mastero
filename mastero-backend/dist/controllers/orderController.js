"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateOrder = exports.updateOrderStatus = exports.getClientOrders = exports.getWorkerOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createOrder = async (req, res) => {
    try {
        const { workerId } = req.body;
        const clientId = req.userId;
        if (!clientId)
            return res.status(401).json({ error: 'Unauthorized' });
        const order = await prisma_1.default.order.create({
            data: {
                clientId,
                workerId,
                status: 'pending'
            }
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const getWorkerOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const worker = await prisma_1.default.worker.findUnique({ where: { userId } });
        if (!worker)
            return res.status(404).json({ error: 'Worker profile not found' });
        const orders = await prisma_1.default.order.findMany({
            where: { workerId: worker.id },
            include: {
                client: {
                    select: { name: true, email: true, avatar: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getWorkerOrders = getWorkerOrders;
const getClientOrders = async (req, res) => {
    try {
        const clientId = req.userId;
        const orders = await prisma_1.default.order.findMany({
            where: { clientId },
            include: {
                worker: {
                    include: {
                        user: { select: { name: true, avatar: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getClientOrders = getClientOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // accepted, declined, completed
        const userId = req.userId;
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: { worker: true }
        });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        // Only worker can accept/decline/complete
        if (order.worker.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updated = await prisma_1.default.order.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const rateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId;
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: { worker: true }
        });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        if (order.clientId !== userId)
            return res.status(403).json({ error: 'Unauthorized' });
        if (order.status !== 'completed')
            return res.status(400).json({ error: 'Order must be completed before rating' });
        const updatedOrder = await prisma_1.default.order.update({
            where: { id },
            data: { rating, comment }
        });
        // Update worker average rating
        const workerOrders = await prisma_1.default.order.findMany({
            where: {
                workerId: order.workerId,
                rating: { not: null }
            }
        });
        const avgRating = workerOrders.reduce((acc, curr) => acc + curr.rating, 0) / workerOrders.length;
        await prisma_1.default.worker.update({
            where: { id: order.workerId },
            data: { rating: avgRating }
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ error: 'Failed to rate order' });
    }
};
exports.rateOrder = rateOrder;
