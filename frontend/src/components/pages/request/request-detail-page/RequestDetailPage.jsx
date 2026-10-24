import {useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import {REQUEST_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import {formatDateTime} from "../../../../utils/date.js";

export default function RequestDetailPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const {user} = useAuth();

    const [request, setRequest] = useState(null);

    useEffect(() => {
        apiFetch(`/api/requests/${id}`, {token})
            .then(setRequest)
            .catch(console.error);
    }, [id, token]);

    if (!request) return <p className="p-6">Загрузка...</p>;

    const canEdit = ["manager", "admin"].includes(user?.role?.name);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Link to="/requests" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                ← Назад к заявкам
            </Link>

            <h2 className="text-2xl font-bold mb-4">Заявка</h2>

            <div className="bg-white rounded shadow p-4 mb-4 space-y-1 text-sm text-gray-600">
                <p>Адрес: {request.address || "-"}</p>
                <p>Дата и время: {formatDateTime(request.data)}</p>
                <p>Статус: {REQUEST_STATUS_OPTIONS[request.status] ?? request.status ?? "-"}</p>
                <p>Менеджер: {request.user?.name || "-"}</p>
                <p>
                    Услуги: {request.services?.length ? request.services.map((s) => s.name).join(", ") : "-"}
                </p>
                {request.description && <p>Описание: {request.description}</p>}
            </div>

            <p className="text-gray-700 mb-2">Заказ</p>
            {request.order_id ? (
                <Link
                    to={`/orders/${request.order_id}`}
                    className="mb-4 inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                >
                    <span aria-hidden="true">📦</span>
                    Перейти к заказу
                </Link>
            ) : (
                <p className="text-sm text-gray-500 mb-4">Заказ ещё не создан</p>
            )}

            <div className="flex gap-3 mt-4">
                {canEdit && (
                    <Link to={`/requests/edit/${request.id}`} className="text-sm text-blue-600 hover:underline">
                        ✎ Редактировать
                    </Link>
                )}
                <Link to={`/requests/chat/${request.id}`} className="text-sm text-custom-blue hover:underline">
                    💬 Чат
                </Link>
            </div>
        </div>
    );
}
