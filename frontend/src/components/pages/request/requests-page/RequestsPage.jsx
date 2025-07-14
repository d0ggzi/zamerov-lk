import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import Request from "../../../blocks/request/Request.jsx";

export default function RequestsPage() {
    const [token, setToken] = useContext(UserContext);
    const {user} = useAuth();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch(`/api/users/${user.id}/requests`, {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setRequests(data))
            .catch(console.error);
    }, [token]);


    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                {requests.length === 0 ? (
                    <p className="text-gray-500">Нет заявок</p>
                ) : (
                    requests.map((req) => (
                        <Request key={req.id} request={req}/>
                    ))
                )}
            </div>
            {["manager", "admin"].includes(user?.role?.name) && (
                <Link to="/requests/new"
                      className="flex flex-row justify-center items-center mt-4 text-blue-600 hover:underline">
                    + Создать заявку
                </Link>
            )}
        </>
    )
}