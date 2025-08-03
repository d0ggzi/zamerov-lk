import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import Service from "../../../blocks/service/Service.jsx";

export default function ServicesPage() {
    const [token, setToken] = useContext(UserContext);
    const {user} = useAuth();
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetch("/api/services/", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setServices(data))
            .catch(console.error);
    }, [token]);

    const handleDelete = (id) => {
        if (!window.confirm("Удалить услугу?")) return;

        fetch(`/api/services/${id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => {
                if (res.ok) {
                    setServices((prev) => prev.filter((s) => s.id !== id));
                } else {
                    throw new Error("Ошибка при удалении");
                }
            })
            .catch((err) => alert(err.message));
    };

    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                <div className="space-y-2">
                    {services.length === 0 ? (
                        <p className="text-gray-500">Нет услуг</p>
                    ) : (
                        services.map((service) => (
                            <Service key={service.id} service={service} onDelete={handleDelete} canDelete={["manager", "admin"].includes(user?.role?.name)}/>
                        ))
                    )}
                </div>


            </div>
            {["manager", "admin"].includes(user?.role?.name) && (
                <Link to="/services/new"
                      className="flex flex-row justify-center items-center mt-4 text-blue-600 hover:underline">
                    + Создать услугу
                </Link>
            )}
        </>
    )
}