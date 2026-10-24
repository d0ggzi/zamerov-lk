export const REQUEST_STATUS_OPTIONS = {
    NEW: "Новая",
    CLARIFICATION: "Уточняются данные",
    CANCELLED: "Отменено",
    CONSULTATION: "На согласовании",

    PAYMENT_IN_PROGRESS: "Ждем оплату",
    PAYMENT_VERIFICATION: "Требуется подтверждение оплаты",
    NO_PAYMENT: "Без оплаты",
    PREPAID: "Предоплачено 50%",

    ORDER: "Заказ",
    INVOICE_ISSUED: "Выставлен окончательный счет",
    PAID: "Оплачено"
}

export const ORDER_STATUS_OPTIONS = {
    READY: "Готов",
    ACCEPTED: "Принято в работу",
    CONSULTATION: "На согласовании",
    RESCHEDULE: "Перенос",
    CANCELLED: "Отменено",
    COMPLETED: "Выполнен"
};

// Статусы заявки, требующие оплаты — показываются на странице оплаты.
export const PAYABLE_REQUEST_STATUSES = ["PAYMENT_IN_PROGRESS", "PREPAID", "INVOICE_ISSUED"];

// Статусы документа. Список может расширяться.
export const DOCUMENT_STATUS_OPTIONS = {
    NOT_SIGNED: "Не подписан",
    SIGNED: "Подписан"
};