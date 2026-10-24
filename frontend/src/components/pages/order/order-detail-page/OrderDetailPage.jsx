import {useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import {ORDER_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import {formatDateTime} from "../../../../utils/date.js";
import ImageGallery from "../../../blocks/image-gallery/ImageGallery.jsx";
import DocumentGallery from "../../../blocks/document-gallery/DocumentGallery.jsx";

export default function OrderDetailPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const {user, isManager} = useAuth();

    const [order, setOrder] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [showDocs, setShowDocs] = useState(false);

    useEffect(() => {
        apiFetch(`/api/orders/${id}`, {token})
            .then(setOrder)
            .catch(console.error);
    }, [id, token]);

    useEffect(() => {
        apiFetch(`/api/orders/${id}/photos`, {token})
            .then(setPhotos)
            .catch(console.error);
    }, [id, token]);

    useEffect(() => {
        apiFetch(`/api/orders/${id}/documents`, {token})
            .then(setDocuments)
            .catch(console.error);
    }, [id, token]);

    if (!order) return <p className="p-6">Загрузка...</p>;

    const canEdit = isManager || order.employee?.id === user?.id;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                ← Назад к заказам
            </Link>

            <h2 className="text-2xl font-bold mb-4">Заказ</h2>

            <div className="bg-white rounded shadow p-4 mb-4 space-y-1 text-sm text-gray-600">
                <p>Адрес: {order.address || "-"}</p>
                <p>Дата и время: {formatDateTime(order.data)}</p>
                {order.end_data && <p>Окончание: {formatDateTime(order.end_data)}</p>}
                <p>Статус: {ORDER_STATUS_OPTIONS[order.status] ?? order.status ?? "-"}</p>
                <p>Исполнитель: {order.employee?.name || "не назначен"}</p>
                <p>
                    Услуги: {order.services?.length ? order.services.map((s) => s.name).join(", ") : "-"}
                </p>
                {order.description && <p>Описание: {order.description}</p>}
            </div>

            <p className="text-gray-700 mb-2">Фотографии</p>
            {photos.length > 0 ? (
                <button
                    onClick={() => setShowGallery(true)}
                    className="mb-4 inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                    title="Открыть фотографии"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                         fill="currentColor">
                        <path
                            d="M4 5a2 2 0 0 0-2 2v8.5A2.5 2.5 0 0 0 4.5 18H18a2 2 0 0 0 2-2V9l-4-4H4zM3 7a1 1 0 0 1 1-1h11v3a1 1 0 0 0 1 1h3v6a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 15.5V7zm6.5 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
                    </svg>
                    Смотреть фото ({photos.length})
                </button>
            ) : (
                <p className="text-sm text-gray-500 mb-4">Фотографий пока нет</p>
            )}

            <p className="text-gray-700 mb-2">Документы</p>
            {documents.length > 0 ? (
                <button
                    onClick={() => setShowDocs(true)}
                    className="mb-4 inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                    title="Открыть документы"
                >
                    <span aria-hidden="true">📄</span>
                    Смотреть документы ({documents.length})
                </button>
            ) : (
                <p className="text-sm text-gray-500 mb-4">Документов пока нет</p>
            )}

            {canEdit && (
                <div className="flex gap-3 mt-4">
                    <Link to={`/orders/edit/${order.id}`} className="text-sm text-blue-600 hover:underline">
                        ✎ Редактировать
                    </Link>
                    <Link to={`/orders/chat/${order.id}`} className="text-sm text-custom-blue hover:underline">
                        💬 Чат
                    </Link>
                </div>
            )}

            <ImageGallery
                images={photos}
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />

            <DocumentGallery
                documents={documents}
                isOpen={showDocs}
                onClose={() => setShowDocs(false)}
            />
        </div>
    );
}
