import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {apiFetch} from "../../../../api/client.js";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: { email, name, password, role_name: "user" },
      });
      navigate("/login");
    } catch {
      setError("Ошибка при регистрации");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Регистрация</h1>
        <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button type="submit" className={buttonPrimary}>Зарегистрироваться</button>
        <p className="text-sm mt-3 text-center">
          Уже есть аккаунт? <Link to="/login" className="text-custom-yellow hover:underline">Войти</Link>
        </p>
      </form>
    </div>
  );
}
