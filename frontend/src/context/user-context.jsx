import {createContext, useEffect, useState} from "react";
import {apiFetch, ApiError} from "../api/client.js";

export const UserContext = createContext();

export const UserProvider = (props) => {
    const [token, setToken] = useState(localStorage.getItem("awesomeLeadsToken"));

    useEffect(() => {
        if (!token) {
            localStorage.removeItem("awesomeLeadsToken");
            return;
        }

        localStorage.setItem("awesomeLeadsToken", token);

        // Проверяем токен на бэкенде: если он невалиден/протух (ApiError, напр. 401) —
        // разлогиниваем. Сетевые ошибки не трогают сессию, отмену запроса игнорируем.
        const controller = new AbortController();
        apiFetch("/api/users/me", {token, signal: controller.signal})
            .catch((error) => {
                if (error.name === "AbortError") return;
                if (error instanceof ApiError) setToken(null);
                else console.error(error);
            });

        return () => controller.abort();
    }, [token]);

    return (
        <UserContext.Provider value={[token, setToken]}>
            {props.children}
        </UserContext.Provider>
    );
};