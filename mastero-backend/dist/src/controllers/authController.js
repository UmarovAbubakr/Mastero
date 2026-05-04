"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const i18n_1 = require("../utils/i18n");
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const getLocale = (req) => {
    const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
    return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: (0, i18n_1.t)('user_exists', getLocale(req)) });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'client',
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: (0, i18n_1.t)('server_error', getLocale(req)) });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: (0, i18n_1.t)('invalid_credentials', getLocale(req)) });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: (0, i18n_1.t)('invalid_credentials', getLocale(req)) });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                bio: true,
                avatar: true,
                worker: {
                    include: {
                        works: true
                    }
                }
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, avatar } = req.body;
        const userId = req.userId;
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { name, phone, bio, avatar },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                bio: true,
                avatar: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('server_error', getLocale(req)) });
    }
};
exports.updateProfile = updateProfile;
