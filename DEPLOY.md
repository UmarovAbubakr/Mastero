# 🚀 Инструкция по деплою Mastero

Этот проект состоит из двух частей: **Frontend (Next.js)** и **Backend (Node.js + Prisma)**.

## 1. Загрузка на GitHub
1. Создайте новый приватный репозиторий на GitHub.
2. Инициализируйте git в папке проекта (если еще не сделано):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin master
   ```

## 2. Деплой Бэкенда (Railway) — Рекомендую
1. Зайдите на [Railway.app](https://railway.app/).
2. Нажмите **New Project** -> **GitHub Repo** -> выберите ваш репозиторий.
3. В настройках (Variables) добавьте содержимое вашего `.env` из папки `mastero-backend`:
   * `DATABASE_URL`: `file:./data/dev.db`
   * `JWT_SECRET`: (ваша секретная строка)
   * `GROQ_API_KEY`: (ваш ключ)
   * `GOOGLE_CLIENT_ID`: (ваш ID)
   * `TELEGRAM_BOT_TOKEN`: (ваш токен)
4. В разделе **Settings** установите **Root Directory** на `mastero-backend`.
5. Добавьте **Volume** по пути `/app/mastero-backend/data`, чтобы база данных SQLite не удалялась при перезагрузке.

## 3. Деплой Фронтенда (Vercel)
1. Зайдите на [Vercel.com](https://vercel.com/).
2. Нажмите **Add New** -> **Project** -> выберите ваш репозиторий.
3. В поле **Root Directory** выберите `mastero-frontend`.
4. В **Environment Variables** добавьте:
   * `NEXT_PUBLIC_API_URL`: (URL вашего бэкенда от Railway, например `https://mastero-backend-production.up.railway.app/api`)
   * `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: (тот же, что и в бэкенде)
5. Нажмите **Deploy**.

## 4. Настройка Google OAuth
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/).
2. В настройках вашего API ключа добавьте URL вашего фронтенда от Vercel в:
   * **Authorized JavaScript origins**
   * **Authorized redirect URIs**

## 5. Настройка Telegram
1. Если вы используете вебхуки, убедитесь, что бэкенд доступен по HTTPS.
2. В текущей реализации бот работает через Polling, поэтому он просто запустится на сервере и будет работать.

---
**Готово!** Ваш проект теперь доступен всему миру.
