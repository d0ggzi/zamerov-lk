// Утилиты для работы с датой/временем заказа.

// Человекочитаемый формат для отображения: "13.06.2026, 14:30".
// Если дата не задана/невалидна — возвращает "не задана".
export function formatDateTime(value) {
    if (!value) return "не задана";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "не задана";
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Только время: "14:30".
export function formatTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
}

// Date -> строка для <input type="datetime-local"> ("YYYY-MM-DDTHH:MM" в локальном времени).
export function toDatetimeLocal(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
