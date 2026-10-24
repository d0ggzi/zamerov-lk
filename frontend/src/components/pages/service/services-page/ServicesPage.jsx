import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import Service from "../../../blocks/service/Service.jsx";

export default function ServicesPage() {
    const [token] = useContext(UserContext);
    const {isManager} = useAuth();
    const [services, setServices] = useState([]);

    useEffect(() => {
        apiFetch("/api/services/", {token})
            .then(setServices)
            .catch(console.error);
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить услугу?")) return;
        try {
            await apiFetch(`/api/services/${id}`, {token, method: "DELETE"});
            setServices((prev) => prev.filter((s) => s.id !== id));
        } catch {
            alert("Ошибка при удалении");
        }
    };

    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                <div className="space-y-2">
                    {services.length === 0 ? (
                        <p className="text-gray-500">Нет услуг</p>
                    ) : (
                        services.map((service) => (
                            <Service key={service.id} service={service} onDelete={handleDelete} canDelete={isManager}/>
                        ))
                    )}
                </div>


            </div>
            {isManager && (
                <Link to="/services/new"
                      className="flex flex-row justify-center items-center mt-4 text-blue-600 hover:underline">
                    + Создать услугу
                </Link>
            )}
        </>
    )
}