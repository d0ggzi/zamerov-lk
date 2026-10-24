import {useState, useContext, useEffect} from "react";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import {apiFetch, ApiError} from "../../../api/client.js";
import {buttonPrimary, inputStyle} from "../../themes/default.js";

export default function ProfilePage() {
    const [token, setToken] = useContext(UserContext);
    const {user} = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    const resetPasswordFields = () => {
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirm("");
    };

    // Префилл из токена, как только он декодируется.
    useEffect(() => {
        if (!user) return;
        setName(user.name ?? "");
        setEmail(user.email ?? "");
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (name.trim().length === 0) {
            setError("Имя не может быть пустым");
            return;
        }
        if (email.trim().length === 0) {
            setError("Почта не может быть пустой");
            return;
        }
        if (changingPassword) {
            if (!currentPassword) {
                setError("Введите текущий пароль");
                return;
            }
            if (!password) {
                setError("Введите новый пароль");
                return;
            }
            if (password !== passwordConfirm) {
                setError("Пароли не совпадают");
                return;
            }
        }

        const body = {name: name.trim(), email: email.trim()};
        if (changingPassword) {
            body.current_password = currentPassword;
            body.password = password;
        }

        setSaving(true);
        try {
            const {access_token} = await apiFetch("/api/users/me", {token, method: "PATCH", body});
            // Обновляем токен: в нём хранятся имя/почта, которые показываются в интерфейсе.
            setToken(access_token);
            resetPasswordFields();
            setChangingPassword(false);
            setSuccess("Профиль обновлён");
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError("Эта почта уже используется");
            } else if (err instanceof ApiError && err.status === 400) {
                setError("Текущий пароль указан неверно");
            } else {
                setError("Не удалось сохранить изменения");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Профиль</h2>
            <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputStyle}
                />

                <label className="block text-sm font-medium mb-1">Почта</label>
                <input
                    type="email"
                    placeholder="Почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle}
                />

                {!changingPassword ? (
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setChangingPassword(true);
                        }}
                        className="mb-3 text-sm font-medium text-custom-blue hover:underline"
                    >
                        Установить новый пароль
                    </button>
                ) : (
                    <div className="mb-3 border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold">Смена пароля</span>
                            <button
                                type="button"
                                onClick={() => {
                                    resetPasswordFields();
                                    setChangingPassword(false);
                                    setError("");
                                }}
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Отмена
                            </button>
                        </div>

                        <label className="block text-sm font-medium mb-1">Текущий пароль</label>
                        <input
                            type="password"
                            placeholder="Текущий пароль"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputStyle}
                            autoComplete="current-password"
                        />

                        <label className="block text-sm font-medium mb-1">Новый пароль</label>
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            autoComplete="new-password"
                        />

                        <label className="block text-sm font-medium mb-1">Повторите пароль</label>
                        <input
                            type="password"
                            placeholder="Повторите новый пароль"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className={inputStyle}
                            autoComplete="new-password"
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

                <button type="submit" className={buttonPrimary} disabled={saving}>
                    {saving ? "Сохранение…" : "Сохранить"}
                </button>
            </form>
        </div>
    );
}
