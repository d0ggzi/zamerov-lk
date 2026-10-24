import {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../context/user-context.jsx";
import {apiFetch} from "../api/client.js";

/**
 * Управляет WebSocket-соединением и историей сообщений для одной комнаты чата.
 * Комната идентифицируется по roomId (UUID заявки или заказа).
 * @param {string|null} roomId
 */
export function useChat(roomId) {
    const [token] = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!roomId || !token) return;
        apiFetch(`/api/chat/rooms/${roomId}/messages`, {token})
            .then((data) => setMessages(data ?? []))
            .catch(console.error);
    }, [roomId, token]);

    useEffect(() => {
        if (!roomId || !token) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/chat/ws/${roomId}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        return () => ws.close();
    }, [roomId, token]);

    const send = (content, fileUrl = null, fileName = null) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const payload = {content};
            if (fileUrl) payload.file_url = fileUrl;
            if (fileName) payload.file_name = fileName;
            wsRef.current.send(JSON.stringify(payload));
        }
    };

    return {messages, send, connected};
}
