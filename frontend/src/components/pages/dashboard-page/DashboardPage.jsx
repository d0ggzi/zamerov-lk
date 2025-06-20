import {useContext, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import Request from "../../../components/blocks/request/Request.jsx";

export default function DashboardPage() {
  const [token, setToken] = useContext(UserContext);
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(console.error);

    fetch("/api/requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRequests(data.filter((r) => r.user_id === user?.sub)))
      .catch(console.error);
  }, [token]);

  const logout = () => setToken(null);

  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Здравствуйте, {me?.name || user?.name}</h2>
          <button onClick={logout} className="text-red-500 hover:underline">Выйти</button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Мои заявки</h3>
          <div className="space-y-2">
            {requests.length === 0 ? (
                <p className="text-gray-500">Нет заявок</p>
            ) : (
                requests.map((req) => (
                    <Request key={req.id} request={req}/>
                ))
            )}
          </div>
        </div>

        {["manager", "admin"].includes(user?.role?.name) && (
            <Link to="/requests/new" className="inline-block mt-4 text-blue-600 hover:underline">
              + Создать заявку
            </Link>
        )}
      </div>
  );
}