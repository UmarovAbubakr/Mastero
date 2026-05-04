import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const conversations = await (prisma as any).conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify user is participant
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: id as string },
      include: { participants: { select: { id: true } } }
    });

    if (!conversation || !(conversation as any).participants.some((p: any) => p.id === userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await (prisma as any).message.findMany({
      where: { conversationId: id as string },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true }
        },
        reactions: true
      }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content, imageUrl } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const message = await (prisma as any).message.create({
      data: {
        conversationId: conversationId as string,
        senderId: userId,
        content: content || '',
        imageUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: { id: true, name: true }
        },
        reactions: true
      }
    });

    // Update conversation timestamp
    await (prisma as any).conversation.update({
      where: { id: conversationId as string },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await (prisma as any).message.findUnique({ where: { id } });
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized or not found' });
    }

    const updated = await (prisma as any).message.update({
      where: { id },
      data: { content, isEdited: true },
      include: { reactions: true, sender: { select: { name: true } } }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await (prisma as any).message.findUnique({ where: { id } });
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized or not found' });
    }

    await (prisma as any).message.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

export const toggleReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.userId;

    const existing = await (prisma as any).reaction.findFirst({
      where: { messageId, userId, emoji }
    });

    if (existing) {
      await (prisma as any).reaction.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      const reaction = await (prisma as any).reaction.create({
        data: { messageId, userId, emoji }
      });
      res.json({ action: 'added', reaction });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
};

import { t } from '../utils/i18n';

const getLocale = (req: any) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
  return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};

export const startConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: t('auth_required', getLocale(req)) });
    if (userId === receiverId) return res.status(400).json({ error: t('error_self_chat', getLocale(req)) });

    // Check if conversation already exists
    let conversation = await (prisma as any).conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: receiverId } } }
        ]
      },
      include: {
        participants: {
          select: { id: true, name: true }
        }
      }
    });

    if (!conversation) {
      conversation = await (prisma as any).conversation.create({
        data: {
          participants: {
            connect: [
              { id: userId },
              { id: receiverId }
            ]
          }
        },
        include: {
          participants: {
            select: { id: true, name: true }
          }
        }
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
};
