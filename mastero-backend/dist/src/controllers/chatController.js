"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConversation = exports.toggleReaction = exports.deleteMessage = exports.editMessage = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await prisma_1.default.conversation.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        // Verify user is participant
        const conversation = await prisma_1.default.conversation.findUnique({
            where: { id: id },
            include: { participants: { select: { id: true } } }
        });
        if (!conversation || !conversation.participants.some((p) => p.id === userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const messages = await prisma_1.default.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true }
                },
                reactions: true
            }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, imageUrl } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const message = await prisma_1.default.message.create({
            data: {
                conversationId: conversationId,
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
        await prisma_1.default.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};
exports.sendMessage = sendMessage;
const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        const message = await prisma_1.default.message.findUnique({ where: { id } });
        if (!message || message.senderId !== userId) {
            return res.status(403).json({ error: 'Unauthorized or not found' });
        }
        const updated = await prisma_1.default.message.update({
            where: { id },
            data: { content, isEdited: true },
            include: { reactions: true, sender: { select: { name: true } } }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to edit message' });
    }
};
exports.editMessage = editMessage;
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const message = await prisma_1.default.message.findUnique({ where: { id } });
        if (!message || message.senderId !== userId) {
            return res.status(403).json({ error: 'Unauthorized or not found' });
        }
        await prisma_1.default.message.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
const toggleReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.userId;
        const existing = await prisma_1.default.reaction.findFirst({
            where: { messageId, userId, emoji }
        });
        if (existing) {
            await prisma_1.default.reaction.delete({ where: { id: existing.id } });
            res.json({ action: 'removed' });
        }
        else {
            const reaction = await prisma_1.default.reaction.create({
                data: { messageId, userId, emoji }
            });
            res.json({ action: 'added', reaction });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle reaction' });
    }
};
exports.toggleReaction = toggleReaction;
const i18n_1 = require("../utils/i18n");
const getLocale = (req) => {
    const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
    return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};
const startConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: (0, i18n_1.t)('auth_required', getLocale(req)) });
        if (userId === receiverId)
            return res.status(400).json({ error: (0, i18n_1.t)('error_self_chat', getLocale(req)) });
        // Check if conversation already exists
        let conversation = await prisma_1.default.conversation.findFirst({
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
            conversation = await prisma_1.default.conversation.create({
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
    }
    catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
};
exports.startConversation = startConversation;
