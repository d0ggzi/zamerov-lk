import {useContext, useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";
import {REQUEST_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import MultiSelectDropdown from "../../../blocks/multi-select-dropdown/MultiSelectDropdown.jsx";
import {UserContext} from "../../../../context/user-context.jsx";
import {apiFetch} from "../../../../api/client.js";
import {sameIdSet} from "../../../../utils/array.js";
import {toDatetimeLocal} from "../../../../utils/date.js";

export default function RequestEditPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState(null);

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    useEffect(() => {
        apiFetch(`/api/requests/${id}`, {token})
            .then((data) => {
                setRequest(data);
                setDescription(data.description || "");
                setAddress(data.address || "");
                setStatus(data.status || "");
                setDate(data.data ? new Date(data.data) : null);
                setSelectedServices(data.services ? data.services.map(service => service.id) : []);
            })
            .catch(console.error);
    }, [id, token]);

    useEffect(() => {
        apiFetch("/api/services/", {token})
            .then(setServices)
            .catch(console.error);
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFields = {};
        if (description !== (request.description || "")) {
            updatedFields.description = description;
        }
        if (address !== (request.address || "")) {
            updatedFields.address = address;
        }
        if (status !== (request.status || "")) {
            updatedFields.status = status;
        }
        const originalData = request.data ? new Date(request.data).toISOString() : null;
        const newData = date ? date.toISOString() : null;
        if (newData !== originalData) {
            updatedFields.data = newData;
        }
        if (!sameIdSet(selectedServices, request.services.map((s) => s.id))) {
            updatedFields.services_ids = selectedServices;
        }

        if (Object.keys(updatedFields).length === 0) {
            alert("Нет изменений для сохранения");
            return;
        }

        try {
            await apiFetch(`/api/requests/${id}`, {token, method: "PATCH", body: updatedFields});
            navigate("/requests");
        } catch {
            alert("Ошибка обновления заявки");
        }
    };

    if (!request) return <p className="p-6">Загрузка...</p>;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Редактировать заявку</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Описание"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputStyle}
                />
                <input
                    type="text"
                    placeholder="Адрес"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputStyle}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyle}>
                    <option value="">-- Статус --</option>
                    {Object.entries(REQUEST_STATUS_OPTIONS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <label className="block text-sm text-gray-600 mb-1">Дата и время</label>
                <input
                    type="datetime-local"
                    value={toDatetimeLocal(date)}
                    onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                    className={inputStyle}
                />

                <MultiSelectDropdown
                    options={services}
                    selected={selectedServices}
                    setSelected={setSelectedServices}
                />

                <button type="submit" className={buttonPrimary}>Сохранить</button>
            </form>
        </div>
    );
}
