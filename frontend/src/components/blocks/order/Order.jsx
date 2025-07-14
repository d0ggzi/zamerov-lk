import {cardStyle} from "./styles";
import {Link} from "react-router-dom";
import {useAuth} from "../../../context/useAuth.jsx";
import {ORDER_STATUS_OPTIONS} from "../../../constants/Status.jsx";

export default function Order({order}) {
    const { user } = useAuth();

    return (
        <div className={cardStyle}>
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
        </div>
    );
}