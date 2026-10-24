import {useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {apiFetch} from "../../../../api/client.js";
import Chat from "../../../blocks/chat/Chat.jsx";
import {REQUEST_STATUS_OPTIONS} from "../../../../constants/Status.jsx";

export default function RequestChatPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const [request, setRequest] = useState(null);

    useEffect(() => {
        apiFetch(`/api/requests/${id}`, {token})
            .then(setRequest)
            .catch(console.error);
    }, [id, token]);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Link to="/requests" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                ← Назад к заявкам
            </Link>

            {request && (
                <div className="bg-white rounded shadow p-4 mb-4 space-y-1 text-sm text-gray-600">
                    <p>Адрес: {request.address || "-"}</p>
                    <p>Статус: {REQUEST_STATUS_OPTIONS[request.status] ?? request.status}</p>
                    {request.description && <p>Описание: {request.description}</p>}
                </div>
            )}

            <Chat roomId={id} title="Чат по заявке" className="h-[calc(100vh-16rem)]"/>
        </div>
    );
}
