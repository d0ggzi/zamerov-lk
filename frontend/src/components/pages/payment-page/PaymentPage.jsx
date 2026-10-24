import {useContext, useEffect, useState} from "react";
import {UserContext} from "../../../context/user-context.jsx";
import {apiFetch} from "../../../api/client.js";
import {PAYABLE_REQUEST_STATUSES, REQUEST_STATUS_OPTIONS} from "../../../constants/Status.jsx";
import {orderTitle} from "../../../utils/order.js";
import {formatDateTime} from "../../../utils/date.js";
import DocumentList from "../../blocks/document-list/DocumentList.jsx";

export default function PaymentPage() {
    const [token] = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        apiFetch("/api/requests/", {token})
            .then((data) => setRequests(data.filter((r) => PAYABLE_REQUEST_STATUSES.includes(r.status))))
            .catch(console.error);
    }, [token]);

    // Документы заказа подгружаем при выборе заявки.
    useEffect(() => {
        setDocs([]);
        if (selected?.order_id) {
            apiFetch(`/api/orders/${selected.order_id}/documents`, {token})
                .then(setDocs)
                .catch(console.error);
        }
    }, [selected, token]);

    // Заглушка оплаты.
    const pay = (request) => {
        alert(`Оплата заявки «${orderTitle(request)}» — заглушка (платёжный шлюз не подключён).`);
    };

    return (
        <div className="p-4 md:p-10">
            <h1 className="text-xl mb-6">Оплата</h1>

            {requests.length === 0 ? (
                <p className="text-gray-500">Нет заявок, ожидающих оплаты</p>
            ) : (
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {requests.map((req) => (
                        <button
                            key={req.id}
                            type="button"
                            onClick={() => setSelected(req)}
                            className="bg-white p-4 rounded shadow text-left hover:shadow-md transition-shadow space-y-1"
                        >
                            <p className="text-sm text-gray-700">{orderTitle(req)}</p>
                            <p className="text-sm text-gray-500">
                                {REQUEST_STATUS_OPTIONS[req.status] ?? req.status}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {selected && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-[min(100%-2rem,560px)] max-h-[90vh] overflow-auto p-5"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-700">Оплата заявки</span>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                aria-label="Закрыть"
                                className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <p>Адрес: {selected.address || "-"}</p>
                            <p>Дата и время: {formatDateTime(selected.data)}</p>
                            <p>Статус: {REQUEST_STATUS_OPTIONS[selected.status] ?? selected.status}</p>
                            <p>Услуги: {selected.services?.length ? selected.services.map((s) => s.name).join(", ") : "-"}</p>
                            {selected.description && <p>Описание: {selected.description}</p>}
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-700 mb-1">Документы</p>
                            <DocumentList documents={docs} emptyText="Документов нет"/>
                        </div>

                        <button
                            type="button"
                            onClick={() => pay(selected)}
                            className="w-full mt-5 bg-custom-black text-custom-yellow p-2 rounded hover:bg-black"
                        >
                            Перейти к оплате →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
