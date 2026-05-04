import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { workerId } = req.body;
    const clientId = req.userId;

    if (!clientId) return res.status(401).json({ error: 'Unauthorized' });

    const order = await (prisma as any).order.create({
      data: {
        clientId,
        workerId,
        status: 'pending'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getWorkerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const worker = await prisma.worker.findUnique({ where: { userId } });
    
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const orders = await (prisma as any).order.findMany({
      where: { workerId: worker.id },
      include: {
        client: {
          select: { name: true, email: true, avatar: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getClientOrders = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.userId;
    const orders = await (prisma as any).order.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // accepted, declined, completed
    const userId = req.userId;

    const order = await (prisma as any).order.findUnique({
      where: { id },
      include: { worker: true }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only worker can accept/decline/complete
    if (order.worker.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await (prisma as any).order.update({
      where: { id },
      data: { status }
    });

    // If order is completed, update worker statistics
    if (status === 'completed') {
      await prisma.worker.update({
        where: { id: order.workerId },
        data: {
          completedOrders: { increment: 1 },
          // Note: totalEarnings could be calculated from a price field in order, 
          // but for now we'll use the worker's current hourly price as a placeholder
          totalEarnings: { increment: order.worker.price }
        }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const rateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    const order = await (prisma as any).order.findUnique({
      where: { id },
      include: { worker: true }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.clientId !== userId) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'completed') return res.status(400).json({ error: 'Order must be completed before rating' });

    const updatedOrder = await (prisma as any).order.update({
      where: { id },
      data: { rating, comment }
    });

    // Update worker average rating
    const workerOrders = await (prisma as any).order.findMany({
      where: { 
        workerId: order.workerId,
        rating: { not: null }
      }
    });

    const avgRating = workerOrders.reduce((acc: number, curr: any) => acc + curr.rating, 0) / workerOrders.length;

    await prisma.worker.update({
      where: { id: order.workerId },
      data: { rating: avgRating }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Failed to rate order' });
  }
};
