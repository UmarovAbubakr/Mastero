import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendTelegramNotification } from '../telegram/bot';

export const createJobRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, budget, city, imageUrl } = req.body;
    const clientId = req.userId;

    if (!clientId) return res.status(401).json({ error: 'Unauthorized' });

    const jobRequest = await (prisma as any).jobRequest.create({
      data: {
        clientId,
        title,
        description,
        category,
        budget: budget ? parseInt(budget.toString()) : null,
        city: city || "Dushanbe",
        imageUrl,
        status: 'open'
      }
    });

    res.status(201).json(jobRequest);

    // Notify workers via Telegram
    try {
      const potentialWorkers = await prisma.worker.findMany({
        where: { 
          category,
          user: { telegramId: { not: null } }
        },
        include: { user: true }
      });

      for (const worker of potentialWorkers) {
        if (worker.user.telegramId) {
          const msg = `🔔 <b>Новый заказ в категории ${category}!</b>\n\n` +
                      `<b>${title}</b>\n` +
                      `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n\n` +
                      `💰 Бюджет: ${budget || 'Договорная'}\n` +
                      `📍 Город: ${city || 'Душанбе'}\n\n` +
                      `<a href="${process.env.FRONTEND_URL || 'https://mastero-beta.vercel.app'}/search">Посмотреть на сайте</a>`;
          sendTelegramNotification(worker.user.telegramId, msg);
        }
      }
    } catch (notifyError) {
      console.error('Failed to send Telegram notifications:', notifyError);
    }
  } catch (error) {
    console.error('Create job request error:', error);
    res.status(500).json({ error: 'Failed to create job request' });
  }
};

export const getJobRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { category, city } = req.query;
    
    const where: any = { status: 'open' };
    if (category) where.category = category;
    if (city) where.city = city;

    const jobs = await (prisma as any).jobRequest.findMany({
      where,
      include: {
        client: { select: { name: true, avatar: true } },
        _count: { select: { proposals: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch job requests' });
  }
};

export const getMyJobRequests = async (req: AuthRequest, res: Response) => {
    try {
      const clientId = req.userId;
      const jobs = await (prisma as any).jobRequest.findMany({
        where: { clientId },
        include: {
          _count: { select: { proposals: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
  
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch your job requests' });
    }
};

export const getJobRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const job = await (prisma as any).jobRequest.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, avatar: true, phone: true } },
        proposals: {
          include: {
            worker: {
              include: { user: { select: { name: true, avatar: true } } }
            }
          }
        }
      }
    });

    if (!job) return res.status(404).json({ error: 'Job request not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job request' });
  }
};

export const createProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { jobRequestId, message, price } = req.body;
    const userId = req.userId;

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) return res.status(403).json({ error: 'Only workers can create proposals' });

    // Check if worker already applied
    const existing = await (prisma as any).proposal.findFirst({
        where: { jobRequestId, workerId: worker.id }
    });
    if (existing) return res.status(400).json({ error: 'You have already applied to this job' });

    const proposal = await (prisma as any).proposal.create({
      data: {
        jobRequestId,
        workerId: worker.id,
        message,
        price: price ? parseInt(price.toString()) : null,
        status: 'pending'
      }
    });

    res.status(201).json(proposal);

    // Notify client via Telegram
    try {
      const job = await (prisma as any).jobRequest.findUnique({
        where: { id: jobRequestId },
        include: { client: { select: { telegramId: true } } }
      });

      const workerUser = await prisma.user.findUnique({
        where: { id: worker.userId },
        select: { name: true }
      });

      if (job?.client?.telegramId) {
        await sendTelegramNotification(
          job.client.telegramId,
          `💡 <b>Новое предложение!</b>\n\nМастер <b>${workerUser?.name}</b> откликнулся на ваш заказ "<b>${job.title}</b>".\n\nПредложенная цена: <b>${price || 'Договорная'}</b>`
        );
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
};

export const acceptProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { proposalId } = req.params;
    const clientId = req.userId;

    const proposal = await (prisma as any).proposal.findUnique({
      where: { id: proposalId },
      include: { jobRequest: true }
    });

    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.jobRequest.clientId !== clientId) return res.status(403).json({ error: 'Unauthorized' });

    // 1. Accept this proposal
    await (prisma as any).proposal.update({
      where: { id: proposalId },
      data: { status: 'accepted' }
    });

    // 2. Reject others
    await (prisma as any).proposal.updateMany({
      where: { 
        jobRequestId: proposal.jobRequestId,
        id: { not: proposalId }
      },
      data: { status: 'rejected' }
    });

    // 3. Close the job
    await (prisma as any).jobRequest.update({
      where: { id: proposal.jobRequestId },
      data: { status: 'closed' }
    });

    // 4. Create an actual Order
    const order = await (prisma as any).order.create({
        data: {
            clientId,
            workerId: proposal.workerId,
            status: 'accepted'
        }
    });

    res.json({ message: 'Proposal accepted', order });

    // Notify worker via Telegram
    try {
      const workerUser = await prisma.user.findUnique({
        where: { id: proposal.worker.userId },
        select: { telegramId: true }
      });

      if (workerUser?.telegramId) {
        await sendTelegramNotification(
          workerUser.telegramId,
          `🎉 <b>Вас выбрали исполнителем!</b>\n\nКлиент принял ваше предложение по заказу "<b>${proposal.jobRequest.title}</b>".\n\nСвяжитесь с клиентом для уточнения деталей.`
        );
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(500).json({ error: 'Failed to accept proposal' });
  }
};
