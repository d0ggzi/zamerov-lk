import {useContext, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";
import {ORDER_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import MultiSelectDropdown from "../../../blocks/multi-select-dropdown/MultiSelectDropdown.jsx";
import ImageGallery from "../../../blocks/image-gallery/ImageGallery.jsx";
import DocumentGallery from "../../../blocks/document-gallery/DocumentGallery.jsx";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import {sameIdSet} from "../../../../utils/array.js";
import {toDatetimeLocal} from "../../../../utils/date.js";

export default function OrderEditPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const {user, isManager} = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const [date, setDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [photos, setPhotos] = useState([]);
    const [showGallery, setShowGallery] = useState(false);

    const [documents, setDocuments] = useState([]);
    const [showDocs, setShowDocs] = useState(false);

    useEffect(() => {
        apiFetch(`/api/orders/${id}`, {token})
            .then((data) => {
                setOrder(data);
                setDescription(data.description || "");
                setAddress(data.address || "");
                setStatus(data.status || "");
                setSelectedEmployee(data.employee?.id || null);
                setSelectedServices(data.services ? data.services.map(service => service.id) : []);
                setDate(data.data ? new Date(data.data) : null);
                setEndDate(data.end_data ? new Date(data.end_data) : null);
            })
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

    useEffect(() => {
        apiFetch("/api/services/", {token})
            .then(setServices)
            .catch(console.error);
    }, [token]);

    useEffect(() => {
        if (!isManager) return;
        apiFetch("/api/users?role=employee", {token})
            .then(setEmployees)
            .catch(console.error);
    }, [token, isManager]);

    const isAssignedEmployee = order?.employee?.id === user?.id;
    const canEdit = isManager || isAssignedEmployee;

    // Фото, как и документы, сохраняются сразу (по одному через POST/DELETE),
    // независимо от кнопки "Сохранить".
    async function handleAddPhotos(newPhotos) {
        try {
            const created = [];
            for (const photo of newPhotos) {
                const saved = await apiFetch(`/api/orders/${id}/photos`, {token, method: "POST", body: {url: photo.url}});
                created.push(saved);
            }
            setPhotos((prev) => [...prev, ...created]);
        } catch (e) {
            console.error(e);
            alert("Не удалось добавить фото. Попробуйте ещё раз.");
        }
    }

    async function handleRemovePhoto(photo) {
        const prev = photos;
        setPhotos((cur) => cur.filter((p) => p.id !== photo.id));
        try {
            await apiFetch(`/api/photos/${photo.id}`, {token, method: "DELETE"});
        } catch (e) {
            console.error(e);
            setPhotos(prev);
            alert("Не удалось удалить фото. Попробуйте ещё раз.");
        }
    }

    // Документы, как и фото, сохраняются сразу — независимо от кнопки "Сохранить".
    async function handleUploadedDocs(uploaded) {
        try {
            const created = [];
            for (const file of uploaded) {
                const doc = await apiFetch(`/api/orders/${id}/documents`, {token, method: "POST", body: file});
                created.push(doc);
            }
            setDocuments((prev) => [...prev, ...created]);
        } catch (e) {
            console.error(e);
            alert("Не удалось сохранить документ. Попробуйте ещё раз.");
        }
    }

    // "Подписание" — заглушка: реальной ЭЦП нет, кнопка просто переводит статус в "Подписан".
    async function handleSignDoc(doc) {
        const prev = documents;
        setDocuments((cur) => cur.map((d) => (d.id === doc.id ? {...d, status: "SIGNED"} : d)));
        try {
            await apiFetch(`/api/documents/${doc.id}`, {token, method: "PATCH", body: {status: "SIGNED"}});
        } catch (e) {
            console.error(e);
            setDocuments(prev);
            alert("Не удалось подписать документ.");
        }
    }

    async function handleDeleteDoc(doc) {
        if (!window.confirm(`Удалить документ «${doc.name}»?`)) return;
        const prev = documents;
        setDocuments((cur) => cur.filter((d) => d.id !== doc.id));
        try {
            await apiFetch(`/api/documents/${doc.id}`, {token, method: "DELETE"});
        } catch (e) {
            console.error(e);
            setDocuments(prev);
            alert("Не удалось удалить документ.");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFields = {};
        // Статус и дата/время доступны для правки и менеджеру, и исполнителю заказа.
        if (status !== (order.status || "")) {
            updatedFields.status = status;
        }
        const originalData = order.data ? new Date(order.data).toISOString() : null;
        const newData = date ? date.toISOString() : null;
        if (newData !== originalData) {
            updatedFields.data = newData;
        }
        if (date && endDate && endDate <= date) {
            alert("Окончание должно быть позже начала");
            return;
        }
        const originalEnd = order.end_data ? new Date(order.end_data).toISOString() : null;
        const newEnd = endDate ? endDate.toISOString() : null;
        if (newEnd !== originalEnd) {
            updatedFields.end_data = newEnd;
        }
        // Остальные поля может менять только менеджер/админ.
        if (isManager) {
            if (description !== (order.description || "")) {
                updatedFields.description = description;
            }
            if (address !== (order.address || "")) {
                updatedFields.address = address;
            }
            if (selectedEmployee !== order.employee?.id) {
                updatedFields.employee_id = selectedEmployee;
            }
            if (!sameIdSet(selectedServices, order.services.map((s) => s.id))) {
                updatedFields.services_ids = selectedServices;
            }
        }

        if (Object.keys(updatedFields).length === 0) {
            alert("Нет изменений для сохранения");
            return;
        }

        try {
            await apiFetch(`/api/orders/${id}`, {token, method: "PATCH", body: updatedFields});
            navigate("/orders");
        } catch {
            alert("Ошибка обновления заказа");
        }
    };

    if (!order) return <p className="p-6">Загрузка...</p>;
    if (!canEdit) return <p className="p-6">Недостаточно прав для редактирования этого заказа</p>;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Редактировать заказ</h2>
            <form onSubmit={handleSubmit}>
                {isManager && (
                    <input
                        type="text"
                        placeholder="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={inputStyle}
                    />
                )}
                {isManager && (
                    <input
                        type="text"
                        placeholder="Адрес"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={inputStyle}
                    />
                )}

                <label className="block text-sm text-gray-600 mb-1">Статус</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyle}>
                    <option value="">-- статус --</option>
                    {Object.entries(ORDER_STATUS_OPTIONS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <label className="block text-sm text-gray-600 mb-1">Начало (дата и время)</label>
                <input
                    type="datetime-local"
                    value={toDatetimeLocal(date)}
                    onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                    className={inputStyle}
                />

                <label className="block text-sm text-gray-600 mb-1">Окончание (дата и время)</label>
                <input
                    type="datetime-local"
                    value={toDatetimeLocal(endDate)}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                    className={inputStyle}
                />

                {isManager && (
                    <MultiSelectDropdown
                        options={services}
                        selected={selectedServices}
                        setSelected={setSelectedServices}
                    />
                )}

                {isManager && (
                    <select
                        value={selectedEmployee ?? "null"}
                        onChange={(e) => setSelectedEmployee(e.target.value === "null" ? null : e.target.value)}
                        className={inputStyle}
                    >
                        <option value="null">-- Без исполнителя --</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>{employee.name}</option>
                        ))}
                    </select>
                )}

                <label className="block text-sm text-gray-600 mb-1">Фотографии</label>
                <button
                    type="button"
                    onClick={() => setShowGallery(true)}
                    className="w-full mb-3 p-2 border border-gray-300 rounded text-left bg-white hover:bg-gray-50"
                >
                    {photos.length > 0 ? `Открыть галерею (${photos.length})` : "Добавить фотографии"}
                </button>

                <label className="block text-sm text-gray-600 mb-1">Документы</label>
                <button
                    type="button"
                    onClick={() => setShowDocs(true)}
                    className="w-full mb-3 p-2 border border-gray-300 rounded text-left bg-white hover:bg-gray-50"
                >
                    {documents.length > 0 ? `Открыть документы (${documents.length})` : "Добавить документы"}
                </button>

                <button type="submit" className={buttonPrimary}>Сохранить</button>
            </form>

            <ImageGallery
                images={photos}
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                onRemove={handleRemovePhoto}
                onAddPhotos={handleAddPhotos}
            />

            <DocumentGallery
                documents={documents}
                isOpen={showDocs}
                onClose={() => setShowDocs(false)}
                onSign={handleSignDoc}
                onDelete={handleDeleteDoc}
                onUpload={handleUploadedDocs}
            />
        </div>
    );
}
