import {cardStyle} from "./styles";
import {Link} from "react-router-dom";
import {useAuth} from "../../../context/useAuth.jsx";
import {ORDER_STATUS_OPTIONS} from "../../../constants/Status.jsx";

export default function Order({order, onDelete, canDelete}) {
    const {user} = useAuth();

    return (
        <div className={`${cardStyle} relative group pb-8`}>
            <p className="font-medium">Описание: {order.description || "-"}</p>
            <p className="text-sm text-gray-600">Адрес: {order.address || "-"}</p>
            <p className="text-sm text-gray-600">Статус: {ORDER_STATUS_OPTIONS[order.status] || "-"}</p>
            <p className="text-sm text-gray-600">Исполнитель: {order.employee?.name || "не назначен"}</p>
            <p className="text-sm text-gray-600">
                Услуги: {order.services && order.services.length > 0 ? order.services.map(s => s.name).join(", ") : "-"}
            </p>
            {["manager", "admin"].includes(user?.role?.name) && (
                <Link
                    to={`/orders/edit/${order.id}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                    ✎ Редактировать
                </Link>
            )}

            {canDelete && (
                <button
                    onClick={() => onDelete(order.id)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить заказ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                         className="w-5 h-5 text-red-600 hover:text-red-800 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"/>
                    </svg>
                </button>
            )}
        </div>
    );
}