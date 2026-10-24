import {useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {apiFetch} from "../../../../api/client.js";
import Chat from "../../../blocks/chat/Chat.jsx";
import {ORDER_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import {formatDateTime} from "../../../../utils/date.js";

export default function OrderChatPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        apiFetch(`/api/orders/${id}`, {token})
            .then(setOrder)
            .catch(console.error);
    }, [id, token]);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                ← Назад к заказам
            </Link>

            {order && (
                <div className="bg-white rounded shadow p-4 mb-4 space-y-1 text-sm text-gray-600">
                    <p>Адрес: {order.address || "-"}</p>
                    <p>Дата и время: {formatDateTime(order.data)}</p>
                    <p>Статус: {ORDER_STATUS_OPTIONS[order.status] ?? order.status}</p>
                    {order.employee && <p>Исполнитель: {order.employee.name}</p>}
                </div>
            )}

            <Chat roomId={id} title="Чат по заказу" className="h-[calc(100vh-16rem)]"/>
        </div>
    );
}
