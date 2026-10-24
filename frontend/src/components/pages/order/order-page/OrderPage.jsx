import {useContext, useEffect, useState} from "react";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import {apiFetch} from "../../../../api/client.js";
import Order from "../../../blocks/order/Order.jsx";

export default function OrderPage() {
    const [token] = useContext(UserContext);
    const {isManager} = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        apiFetch(`/api/orders/`, {token})
            .then(setOrders)
            .catch(console.error);
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить заказ?")) return;
        try {
            await apiFetch(`/api/orders/${id}`, {token, method: "DELETE"});
            setOrders((prev) => prev.filter((s) => s.id !== id));
        } catch {
            alert("Ошибка при удалении");
        }
    };

    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                {orders.length === 0 ? (
                    <p className="text-gray-500">Нет заказов</p>
                ) : (
                    orders.map((order) => (
                        <Order key={order.id} order={order} onDelete={handleDelete} canDelete={isManager}/>
                    ))
                )}
            </div>
        </>
    )
}