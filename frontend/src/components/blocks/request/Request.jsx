import {cardStyle} from "./styles";
import {Link} from "react-router-dom";
import {useAuth} from "../../../context/useAuth.jsx";
import {REQUEST_STATUS_OPTIONS} from "../../../constants/Status.jsx";

export default function Request({request, onDelete, canDelete}) {
    const { user } = useAuth();

    return (
        <div className={`${cardStyle} relative group pb-8`}>
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

            {canDelete && (
                <button
                    onClick={() => onDelete(request.id)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить заявку"
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
