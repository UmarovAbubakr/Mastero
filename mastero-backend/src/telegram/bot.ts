import { Telegraf } from 'telegraf';
import prisma from '../utils/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is missing in .env. Telegram bot will not start.');
}

export const bot = new Telegraf(token || '');

// Start command
bot.start(async (ctx: any) => {
  const message = ctx.message;
  const startPayload = message.text.split(' ')[1];

  if (startPayload) {
    try {
      const userId = startPayload;
      const telegramId = ctx.from.id.toString();

      await prisma.user.update({
        where: { id: userId },
        data: { telegramId },
      });

      await ctx.reply('✅ Ваш аккаунт Mastero успешно привязан к Telegram! Теперь вы будете получать уведомления здесь.');
    } catch (error) {
      console.error('Error linking Telegram:', error);
      await ctx.reply('❌ Ошибка при привязке аккаунта. Пожалуйста, попробуйте снова из личного кабинета на сайте.');
    }
  } else {
    await ctx.reply(
      '👋 Добро пожаловать в Mastero!\n\nЗдесь вы можете получать уведомления о новых заказах и общаться с клиентами.\n\nЧтобы привязать аккаунт, перейдите в настройки профиля на нашем сайте.'
    );
  }
});

bot.help((ctx: any) => {
  ctx.reply('Доступные команды:\n/start - Запустить бота\n/help - Помощь');
});

// Function to send notification to a user
export const sendTelegramNotification = async (telegramId: string, message: string) => {
  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

export const initBot = () => {
  if (token) {
    bot.launch()
      .then(() => console.log('✅ Telegram Bot started'))
      .catch((err: any) => console.error('❌ Failed to start Telegram Bot:', err));
  }
};
