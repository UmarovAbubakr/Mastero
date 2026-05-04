import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export const chatWithAI = async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = (process.env.GROQ_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(500).json({
      error: 'Groq API Key не настроен. Получите бесплатный ключ на https://console.groq.com/keys и добавьте GROQ_API_KEY в .env',
    });
  }

  try {
    // 1. Fetch all workers to give context to AI
    const workers = await prisma.worker.findMany({
      include: {
        user: true,
        orders: true,
      },
    });

    const workersContext = workers.map((w) => ({
      id: w.id,
      name: w.user.name,
      skills: w.skills,
      price: w.price,
      city: w.city,
      about: w.about,
      rating: w.rating,
      reviewsCount: w.orders.length,
    }));

    const systemPrompt = `
Ты — интеллектуальный помощник платформы Mastero. 
Твоя задача — помогать пользователям находить лучших мастеров для их проблем.

Вот список доступных мастеров:
${JSON.stringify(workersContext, null, 2)}

Правила:
1. Анализируй проблему пользователя.
2. Предлагай 1-2 наиболее подходящих мастеров из списка выше.
3. Обосновывай свой выбор (опыт, навыки, рейтинг, цена).
4. Если подходящих мастеров нет, вежливо скажи об этом и посоветуй, как лучше описать задачу.
5. Отвечай на языке пользователя (по умолчанию на русском).
6. Будь профессиональным, дружелюбным и лаконичным.
7. Используй эмодзи для визуального оформления ответов.
8. В конце ответа, если ты рекомендуешь мастера, добавь ссылку на его профиль в формате: [Посмотреть профиль](/worker/ID)
`;

    // 2. Build messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h: any) => ({
        role: h.role === 'ai' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // 3. Call Groq API (real AI — Llama 3.3 70B)
    const groq = new Groq({ apiKey });

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Извините, я не смог сгенерировать ответ.';

    console.log('✅ AI Assistant responded successfully via Groq');

    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error.status, error.message);

    if (error.status === 401) {
      return res.status(500).json({
        error: 'Неверный Groq API ключ. Проверьте GROQ_API_KEY в .env файле.',
      });
    }

    if (error.status === 403) {
      return res.status(500).json({
        error: 'Доступ к Groq заблокирован из вашего региона. Включите системный VPN (ProtonVPN, Windscribe) и перезапустите сервер.',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Слишком много запросов. Подождите несколько секунд и попробуйте снова.',
      });
    }

    res.status(500).json({ error: 'Ошибка обработки запроса', details: error.message });
  }
};
