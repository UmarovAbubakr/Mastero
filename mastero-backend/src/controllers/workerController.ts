import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { t } from '../utils/i18n';

const getLocale = (req: any) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
  return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};

export const registerWorker = async (req: AuthRequest, res: Response) => {
  try {
    const { skills, category, about, price, city, certificateUrl, latitude, longitude, completedOrders, totalEarnings } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!skills || !price) {
      return res.status(400).json({ error: 'Skills and price are required' });
    }

    // Check if already a worker
    const existingWorker = await prisma.worker.findUnique({ where: { userId } });
    if (existingWorker) {
      return res.status(400).json({ error: t('user_exists', getLocale(req)) });
    }

    const worker = await prisma.worker.create({
      data: {
        userId,
        skills,
        category: category || 'other',
        about: about || '',
        price: Number(price),
        city: city || 'Dushanbe',
        certificateUrl: certificateUrl || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        completedOrders: completedOrders ? Number(completedOrders) : 0,
        totalEarnings: totalEarnings ? Number(totalEarnings) : 0,
      },

      include: {
        user: {
          select: {
            name: true,
            email: true,
            subscriptionTier: true,
          },
        },
      },
    });

    // Update user role to worker if it was client
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'worker' },
    });

    res.status(201).json({
      success: true,
      message: 'Worker profile created successfully',
      data: worker,
    });
  } catch (error) {
    console.error('Worker registration error:', error);
    res.status(500).json({ error: t('server_error', getLocale(req)) });
  }
};

export const getAllWorkers = async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { skills: { contains: String(search) } },
        { about: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
      ];
    }

    if (category && category !== 'all') {
      where.category = String(category);
    }

    if (minPrice) {
      where.price = { ...where.price, gte: Number(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'completedOrders') {
      orderBy = { completedOrders: 'desc' };
    }

    const workers = await prisma.worker.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
            subscriptionTier: true,
          },
        },
      },
      // Sorting: Ultra first, then Pro, then Free (SQLite doesn't have custom order easily, 
      // so we sort by subscriptionTier alphabetically or use multiple sort levels)
      orderBy: [
        { user: { subscriptionTier: 'desc' } }, // ULTRA, PRO, FREE (alphabetical happens to work here: U > P > F)
        orderBy,
      ],
    });

    res.json(workers);
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};

export const getTopWorkers = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 4;
    
    const workers = await prisma.worker.findMany({
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            subscriptionTier: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { completedOrders: 'desc' }
      ],
    });

    res.json(workers);
  } catch (error) {
    console.error('Get top workers error:', error);
    res.status(500).json({ error: 'Failed to fetch top workers' });
  }
};

export const getWorkersByIds = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    
    const idArray = String(ids).split(',');
    
    const workers = await prisma.worker.findMany({
      where: {
        id: { in: idArray }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
            subscriptionTier: true,
          },
        },
        works: true,
      }
    });
    
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch compared workers' });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
            subscriptionTier: true,
          },
        },
        works: true,
      },
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addWork = async (req: AuthRequest, res: Response) => {
  try {
    const { title, imageUrl, isBeforeAfter, beforeImageUrl, afterImageUrl } = req.body;
    const userId = req.userId;

    const worker = await prisma.worker.findUnique({ 
      where: { userId },
      include: { 
        user: { select: { subscriptionTier: true } },
        works: true 
      } 
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    // Portfolio Limits Logic
    const tier = worker.user.subscriptionTier;
    const workCount = worker.works.length;

    if (tier === 'FREE' && workCount >= 1) {
      return res.status(403).json({ error: 'Free tier is limited to 1 portfolio item. Upgrade to PRO to add more!' });
    }
    if (tier === 'PRO' && workCount >= 10) {
      return res.status(403).json({ error: 'PRO tier is limited to 10 portfolio items. Upgrade to ULTRA for unlimited access!' });
    }

    const work = await (prisma as any).work.create({
      data: {
        workerId: worker.id,
        title,
        imageUrl: imageUrl || beforeImageUrl || '',
        isBeforeAfter: !!isBeforeAfter,
        beforeImageUrl: beforeImageUrl || null,
        afterImageUrl: afterImageUrl || null,
      },
    });

    res.status(201).json(work);
  } catch (error) {
    console.error('Add work error:', error);
    res.status(500).json({ error: t('server_error', getLocale(req)) });
  }
};

export const deleteWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const work = await (prisma as any).work.findUnique({ where: { id } });
    if (!work || work.workerId !== worker.id) {
      return res.status(403).json({ error: 'Unauthorized or work not found' });
    }

    await (prisma as any).work.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete work' });
  }
};

export const updateWorkerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { skills, category, about, price, city, certificateUrl, latitude, longitude, completedOrders, totalEarnings } = req.body;
    const userId = req.userId;

    const updated = await prisma.worker.update({
      where: { userId },
      data: { 
        skills, 
        category,
        about, 
        price: price ? Number(price) : undefined, 
        city,
        certificateUrl: certificateUrl !== undefined ? certificateUrl : undefined,
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
        completedOrders: completedOrders !== undefined ? Number(completedOrders) : undefined,
        totalEarnings: totalEarnings !== undefined ? Number(totalEarnings) : undefined,
      },
      include: { works: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker profile' });
  }
};

export const getWorkerReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await (prisma as any).order.findMany({
      where: {
        workerId: id,
        status: 'completed',
        rating: { not: null },
      },
      include: {
        client: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

