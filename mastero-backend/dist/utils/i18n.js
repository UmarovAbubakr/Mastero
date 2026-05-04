"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = void 0;
const translations = {
    ru: {
        user_exists: "Пользователь уже существует",
        invalid_credentials: "Неверный логин или пароль",
        server_error: "Ошибка сервера",
        auth_required: "Требуется авторизация",
        not_found: "Не найдено",
        profile_updated: "Профиль успешно обновлен",
        message_sent: "Сообщение отправлено",
        work_added: "Работа добавлена в портфолио",
        unauthorized: "Нет прав доступа"
    },
    en: {
        user_exists: "User already exists",
        invalid_credentials: "Invalid email or password",
        server_error: "Server error",
        auth_required: "Authentication required",
        not_found: "Not found",
        profile_updated: "Profile updated successfully",
        message_sent: "Message sent",
        work_added: "Work added to portfolio",
        unauthorized: "Unauthorized"
    },
    tg: {
        user_exists: "Ин корбар аллакай мавҷуд аст",
        invalid_credentials: "Логин ё рамз нодуруст аст",
        server_error: "Хатогии сервер",
        auth_required: "Воридшавӣ талаб карда мешавад",
        not_found: "Ёфт нашуд",
        profile_updated: "Профил бо муваффақият нав карда шуд",
        message_sent: "Паём фиристода шуд",
        work_added: "Кор ба портфолио илова шуд",
        unauthorized: "Дастрасӣ нест"
    }
};
const t = (key, locale = 'ru') => {
    const lang = translations[locale] ? locale : 'ru';
    return translations[lang][key] || key;
};
exports.t = t;
