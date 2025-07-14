import {useContext, useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";
import {REQUEST_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import MultiSelectDropdown from "../../../blocks/multi-select-dropdown/MultiSelectDropdown.jsx";
import {UserContext} from "../../../../context/user-context.jsx";

export default function RequestEditPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    useEffect(() => {
        fetch(`/api/requests/${id}`, {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => {
                setRequest(data);
                setDescription(data.description || "");
                setAddress(data.address || "");
                setStatus(data.status || "");
                setSelectedServices(data.services ? data.services.map(service => service.id) : []);
            })
            .catch(console.error);
    }, [id, token]);

    useEffect(() => {
        fetch("/api/services/", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setServices(data))
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

        if (Object.keys(updatedFields).length === 0) {
            alert("Нет изменений для сохранения");
            return;
        }

        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedFields),
            });
            if (!res.ok) throw new Error("Ошибка обновления заявки");
            navigate("/requests");
        } catch (err) {
            alert(err.message);
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
