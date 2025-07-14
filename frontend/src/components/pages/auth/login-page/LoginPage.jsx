import {useContext, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setToken] = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Неверный логин или пароль");

      const data = await response.json();
      setToken(data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Вход</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button type="submit" className={buttonPrimary}>Войти</button>
        <p className="text-sm mt-3 text-center">
          Нет аккаунта? <Link to="/register" className="text-custom-yellow hover:underline">Регистрация</Link>
        </p>
      </form>
    </div>
  );
}