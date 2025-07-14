import {cardStyle} from "./styles";
import {Link} from "react-router-dom";
import {useAuth} from "../../../context/useAuth.jsx";
import {REQUEST_STATUS_OPTIONS} from "../../../constants/Status.jsx";

export default function Request({request}) {
    const { user } = useAuth();

    return (
        <div className={cardStyle}>
            <p className="font-medium">Описание: {request.description || "-"}</p>
            <p className="text-sm text-gray-600">Адрес: {request.address || "-"}</p>
            <p className="text-sm text-gray-600">Статус: {REQUEST_STATUS_OPTIONS[request.status] || "-"}</p>
            <p className="text-sm text-gray-600">
                Услуги: {request.services && request.services.length > 0 ? request.services.map(s => s.name).join(", ") : "-"}
            </p>
            {["manager", "admin"].includes(user?.role?.name) && (
                <Link
                    to={`/requests/edit/${request.id}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                    ✎ Редактировать
                </Link>
            )}
        </div>
    );
}