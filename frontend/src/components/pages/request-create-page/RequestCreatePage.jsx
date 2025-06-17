import {useState, useEffect, useContext} from "react";
import { useAuth } from "../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { inputStyle, buttonPrimary } from "./styles";
import {UserContext} from "../../../context/user-context.jsx";

export default function RequestCreatePage() {
  const [token,] = useContext(UserContext);
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/services/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(console.error);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: user.sub,
      description,
      address,
      services_ids: selectedServices,
    };

    try {
      const res = await fetch("/api/requests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка создания заявки");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Создание заявки</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyle} />
        <input type="text" placeholder="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} className={inputStyle} />

        <label className="block mb-2 text-sm font-medium text-gray-700">Выберите услуги:</label>
        <select multiple value={selectedServices} onChange={(e) => setSelectedServices([...e.target.selectedOptions].map(o => o.value))} className="w-full border rounded p-2 mb-4">
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button type="submit" className={buttonPrimary}>Создать</button>
      </form>
    </div>
  );
}
