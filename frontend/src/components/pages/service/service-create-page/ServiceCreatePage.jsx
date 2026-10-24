import {useState, useContext} from "react";
import { useNavigate } from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {apiFetch} from "../../../../api/client.js";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";

export default function ServiceCreatePage() {
  const [token] = useContext(UserContext);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim().length === 0) {
      setError("Имя не может быть пустым");
      return;
    }

    try {
      await apiFetch("/api/services/", {token, method: "POST", body: {name}});
      navigate("/services");
    } catch {
      alert("Ошибка создания услуги");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Создание услуги</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button type="submit" className={buttonPrimary}>Создать</button>
      </form>
    </div>
  );
}
