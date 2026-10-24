import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import Request from "../../../blocks/request/Request.jsx";

export default function RequestsPage() {
    const [token] = useContext(UserContext);
    const {user, isManager} = useAuth();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!user) return;
        apiFetch(`/api/users/${user.id}/requests`, {token})
            .then(setRequests)
            .catch(console.error);
    }, [token, user]);

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить заявку?")) return;
        try {
            await apiFetch(`/api/requests/${id}`, {token, method: "DELETE"});
            setRequests((prev) => prev.filter((s) => s.id !== id));
        } catch {
            alert("Ошибка при удалении");
        }
    };

    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                {requests.length === 0 ? (
                    <p className="text-gray-500">Нет заявок</p>
                ) : (
                    requests.map((req) => (
                        <Request key={req.id} request={req} onDelete={handleDelete} canDelete={isManager}/>
                    ))
                )}
            </div>
            {isManager && (
                <Link to="/requests/new"
                      className="flex flex-row justify-center items-center mt-4 text-blue-600 hover:underline">
                    + Создать заявку
                </Link>
            )}
        </>
    )
}