import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import Request from "../../../components/blocks/request/Request.jsx";

export default function RequestsPage() {
    const [token, setToken] = useContext(UserContext);
    const {user} = useAuth();
    const [me, setMe] = useState(null);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch("/api/users/me", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setMe(data))
            .catch(console.error);

        fetch("/api/requests/", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setRequests(data.filter((r) => r.user_id === user?.sub)))
            .catch(console.error);
    }, [token]);


    return (
        <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4">
                <div className="space-y-2">
                    {requests.length === 0 ? (
                        <p className="text-gray-500">Нет заявок</p>
                    ) : (
                        requests.map((req) => (
                            <Request key={req.id} request={req}/>
                        ))
                    )}
                </div>

                {["manager", "admin"].includes(user?.role?.name) && (
                    <Link to="/requests/new" className="inline-block mt-4 text-blue-600 hover:underline">
                        + Создать заявку
                    </Link>
                )}
            </div>
        </div>
    )
}