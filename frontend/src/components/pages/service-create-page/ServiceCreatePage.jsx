import {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import {UserContext} from "../../../context/user-context.jsx";
import {buttonPrimary, inputStyle} from "../../themes/default.js";

export default function ServiceCreatePage() {
  const [token,] = useContext(UserContext);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name
    };

    try {
      const res = await fetch("/api/services/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка создания услуги");
      navigate("/services");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Создание услуги</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />

        <button type="submit" className={buttonPrimary}>Создать</button>
      </form>
    </div>
  );
}
