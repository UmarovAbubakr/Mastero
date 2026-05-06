import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendTelegramNotification } from '../telegram/bot';

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

    // Notify worker via Telegram
    try {
      const workerData = await prisma.worker.findUnique({
        where: { id: workerId },
        include: { user: { select: { telegramId: true } } }
      });

      const clientData = await prisma.user.findUnique({
        where: { id: clientId },
        select: { name: true }
      });

      if (workerData?.user?.telegramId) {
        await sendTelegramNotification(
          workerData.user.telegramId,
          `📦 <b>Новый заказ!</b>\n\nКлиент <b>${clientData?.name}</b> хочет заказать ваши услуги.\n\nПроверьте раздел заказов в приложении.`
        );
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }
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

    // Notify client via Telegram
    try {
      const clientData = await prisma.user.findUnique({
        where: { id: order.clientId },
        select: { telegramId: true }
      });

      const workerUser = await prisma.user.findUnique({
        where: { id: order.worker.userId },
        select: { name: true }
      });

      if (clientData?.telegramId) {
        let message = '';
        if (status === 'accepted') message = `✅ <b>Ваш заказ принят!</b>\n\nМастер <b>${workerUser?.name}</b> приступил к работе.`;
        if (status === 'declined') message = `❌ <b>Заказ отклонен</b>\n\nК сожалению, мастер <b>${workerUser?.name}</b> не может выполнить работу сейчас.`;
        if (status === 'completed') message = `🏁 <b>Работа завершена!</b>\n\nМастер <b>${workerUser?.name}</b> пометил заказ как выполненный. Пожалуйста, оставьте отзыв!`;

        if (message) {
          await sendTelegramNotification(clientData.telegramId, message);
        }
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }
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

    // Notify worker via Telegram about new rating
    try {
      const workerData = await prisma.worker.findUnique({
        where: { id: order.workerId },
        include: { user: { select: { telegramId: true } } }
      });

      if (workerData?.user?.telegramId) {
        await sendTelegramNotification(
          workerData.user.telegramId,
          `⭐ <b>Новый отзыв!</b>\n\nКлиент поставил вам оценку: <b>${rating} / 5</b>\nКомментарий: <i>${comment || 'Без комментария'}</i>`
        );
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Failed to rate order' });
  }
};
