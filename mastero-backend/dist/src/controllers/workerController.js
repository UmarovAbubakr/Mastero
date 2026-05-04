"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkerProfile = exports.deleteWork = exports.addWork = exports.getWorkerById = exports.getWorkersByIds = exports.getAllWorkers = exports.registerWorker = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const i18n_1 = require("../utils/i18n");
const getLocale = (req) => {
    const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
    return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};
const registerWorker = async (req, res) => {
    try {
        const { skills, category, about, price, city, certificateUrl, latitude, longitude } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!skills || !price) {
            return res.status(400).json({ error: 'Skills and price are required' });
        }
        // Check if already a worker
        const existingWorker = await prisma_1.default.worker.findUnique({ where: { userId } });
        if (existingWorker) {
            return res.status(400).json({ error: (0, i18n_1.t)('user_exists', getLocale(req)) });
        }
        const worker = await prisma_1.default.worker.create({
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
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        // Update user role to worker if it was client
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { role: 'worker' },
        });
        res.status(201).json({
            success: true,
            message: 'Worker profile created successfully',
            data: worker,
        });
    }
    catch (error) {
        console.error('Worker registration error:', error);
        res.status(500).json({ error: (0, i18n_1.t)('server_error', getLocale(req)) });
    }
};
exports.registerWorker = registerWorker;
const getAllWorkers = async (req, res) => {
    try {
        const { search, category } = req.query;
        const where = {};
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
        const workers = await prisma_1.default.worker.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(workers);
    }
    catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
};
exports.getAllWorkers = getAllWorkers;
const getWorkersByIds = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids)
            return res.json([]);
        const idArray = String(ids).split(',');
        const workers = await prisma_1.default.worker.findMany({
            where: {
                id: { in: idArray }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true,
                    }
                },
                works: true,
            }
        });
        res.json(workers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch compared workers' });
    }
};
exports.getWorkersByIds = getWorkersByIds;
const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await prisma_1.default.worker.findUnique({
            where: { id: id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                works: true,
            },
        });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(worker);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getWorkerById = getWorkerById;
const addWork = async (req, res) => {
    try {
        const { title, imageUrl, isBeforeAfter, beforeImageUrl, afterImageUrl } = req.body;
        const userId = req.userId;
        const worker = await prisma_1.default.worker.findUnique({ where: { userId } });
        if (!worker) {
            return res.status(404).json({ error: 'Worker profile not found' });
        }
        const work = await prisma_1.default.work.create({
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
    }
    catch (error) {
        console.error('Add work error:', error);
        res.status(500).json({ error: (0, i18n_1.t)('server_error', getLocale(req)) });
    }
};
exports.addWork = addWork;
const deleteWork = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const worker = await prisma_1.default.worker.findUnique({ where: { userId } });
        if (!worker)
            return res.status(404).json({ error: 'Worker not found' });
        const work = await prisma_1.default.work.findUnique({ where: { id } });
        if (!work || work.workerId !== worker.id) {
            return res.status(403).json({ error: 'Unauthorized or work not found' });
        }
        await prisma_1.default.work.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete work' });
    }
};
exports.deleteWork = deleteWork;
const updateWorkerProfile = async (req, res) => {
    try {
        const { skills, category, about, price, city, certificateUrl, latitude, longitude } = req.body;
        const userId = req.userId;
        const updated = await prisma_1.default.worker.update({
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
            },
            include: { works: true }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update worker profile' });
    }
};
exports.updateWorkerProfile = updateWorkerProfile;
