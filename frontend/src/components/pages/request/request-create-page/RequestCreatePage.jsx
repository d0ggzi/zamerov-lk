import {useState, useEffect, useContext} from "react";
import {useAuth} from "../../../../context/useAuth.jsx";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {apiFetch} from "../../../../api/client.js";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";
import MultiSelectDropdown from "../../../blocks/multi-select-dropdown/MultiSelectDropdown.jsx";

export default function RequestCreatePage() {
    const [token] = useContext(UserContext);
    const {user} = useAuth();
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch("/api/services/", {token})
            .then(setServices)
            .catch(console.error);
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            manager_id: user.id,
            description,
            address,
            services_ids: selectedServices,
        };

        try {
            await apiFetch("/api/requests/", {token, method: "POST", body: payload});
            navigate("/requests");
        } catch {
            alert("Ошибка создания заявки");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Создание заявки</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Описание" value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       className={inputStyle}/>
                <input type="text" placeholder="Адрес" value={address} onChange={(e) => setAddress(e.target.value)}
                       className={inputStyle}/>

                <MultiSelectDropdown
                    options={services}
                    selected={selectedServices}
                    setSelected={setSelectedServices}
                />

                <button type="submit" className={buttonPrimary}>Создать</button>
            </form>
        </div>
    );
}
