import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../utils/prisma';
import { t } from '../utils/i18n';

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const getLocale = (req: Request) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'ru';
  return ['ru', 'en', 'tg'].includes(lang) ? lang : 'ru';
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: t('user_exists', getLocale(req)) });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'client',
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: t('server_error', getLocale(req)) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: t('invalid_credentials', getLocale(req)) });
    }

    if (!user.password) {
      return res.status(401).json({ error: t('invalid_credentials', getLocale(req)) });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: t('invalid_credentials', getLocale(req)) });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, sub: googleId, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Try to find user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (!user) {
      // Create new user if not found
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          avatar: picture,
          role: 'client', // Default role
        }
      });
    } else if (!user.googleId) {
      // Link googleId to existing account if not linked
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: user.avatar || picture }
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Failed to login with Google' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: req.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        phone: true, 
        bio: true, 
        avatar: true,
        telegramId: true,
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone, bio, avatar } = req.body;
    const userId = req.userId;

    const user = await (prisma as any).user.update({
      where: { id: userId },
      data: { name, phone, bio, avatar },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        phone: true, 
        bio: true, 
        avatar: true,
        telegramId: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: t('server_error', getLocale(req)) });
  }
};
