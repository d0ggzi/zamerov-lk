import {formatDateTime} from "./date.js";

// Составной заголовок заказа: адрес + дата/время.
// Используется как основной идентификатор заказа вместо описания
// (описание необязательно и может дублироваться).
// Принимает как объект заказа ({address, data}), так и любой объект
// с этими полями (например, развёрнутый из документа).
export function orderTitle(order) {
    if (!order) return "Заказ";
    const parts = [];
    if (order.address) parts.push(order.address);
    if (order.data) parts.push(formatDateTime(order.data));
    return parts.length ? parts.join(" — ") : "Заказ без адреса и даты";
}
