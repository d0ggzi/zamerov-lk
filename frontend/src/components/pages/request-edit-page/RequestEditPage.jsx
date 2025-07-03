import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {buttonPrimary, inputStyle} from "../../themes/default.js";

export default function RequestEditPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/requests/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRequest(data);
        setDescription(data.description || "");
        setAddress(data.address || "");
        setStatus(data.status || "");
      })
      .catch(console.error);
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      description,
      address,
      status,
    };

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка обновления заявки");
      navigate("/");
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
          <option value="">-- статус --</option>
          <option value="draft">Черновик</option>
          <option value="ready">Готова</option>
          <option value="in_progress">В работе</option>
          <option value="finished">Завершена</option>
        </select>
        <button type="submit" className={buttonPrimary}>Сохранить</button>
      </form>
    </div>
  );
}
