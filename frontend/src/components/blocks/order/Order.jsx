import {useContext, useState} from "react";
import {cardStyle} from "./styles";
import {Link} from "react-router-dom";
import {useAuth} from "../../../context/useAuth.jsx";
import {ORDER_STATUS_OPTIONS} from "../../../constants/Status.jsx";
import ImageGallery from "../image-gallery/ImageGallery.jsx";
import {UserContext} from "../../../context/user-context.jsx";

export default function Order({order, onDelete, canDelete}) {
    const {user} = useAuth();
    const [token] = useContext(UserContext);
    const [showGallery, setShowGallery] = useState(false);

    const [photos, setPhotos] = useState(order.photos ?? []);

    const toUrl = (img) => (typeof img === "string" ? img : img?.url ?? "");

    async function patchPhotos(updatedUrls) {
        const resp = await fetch(`/api/orders/${order.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({photos_urls: updatedUrls}),
        });
        if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(text || `PATCH /api/orders/${order.id} failed`);
        }
    }

    async function handleRemove(image) {
        const url = toUrl(image);
        const prev = photos;
        const next = prev.filter((p) => toUrl(p) !== url);

        setPhotos(next);

        try {
            await patchPhotos(next.map(toUrl));
        } catch (e) {
            console.error(e);
            setPhotos(prev);
            alert("Не удалось удалить фото. Попробуйте ещё раз.");
        }
    }

    return (
        <div className={`${cardStyle} relative group pb-8`}>
            <p className="font-medium">Описание: {order.description || "-"}</p>
            <p className="text-sm text-gray-600">Адрес: {order.address || "-"}</p>
            <p className="text-sm text-gray-600">Статус: {ORDER_STATUS_OPTIONS[order.status] || "-"}</p>
            <p className="text-sm text-gray-600">Исполнитель: {order.employee?.name || "не назначен"}</p>
            <p className="text-sm text-gray-600">
                Услуги: {order.services?.length ? order.services.map((s) => s.name).join(", ") : "-"}
            </p>

            <div>
                {photos?.length > 0 && (
                    <button
                        onClick={() => setShowGallery(true)}
                        className="mt-2 inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                        title="Открыть фотографии"
                    >
                        {/* иконка камеры */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                             fill="currentColor">
                            <path
                                d="M4 5a2 2 0 0 0-2 2v8.5A2.5 2.5 0 0 0 4.5 18H18a2 2 0 0 0 2-2V9l-4-4H4zM3 7a1 1 0 0 1 1-1h11v3a1 1 0 0 0 1 1h3v6a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 15.5V7zm6.5 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
                        </svg>
                        Смотреть фото ({photos.length})
                    </button>
                )}
            </div>

            {["manager", "admin"].includes(user?.role?.name) && (
                <Link to={`/orders/edit/${order.id}`}
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block">
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

            {/* модалка поверх всего с блюром, использует тот же ImageGallery */}
            <ImageGallery
                images={photos}
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                onRemove={handleRemove}
            />
        </div>
    );
}
