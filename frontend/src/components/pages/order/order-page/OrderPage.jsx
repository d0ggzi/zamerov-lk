import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../../context/user-context.jsx";
import {useAuth} from "../../../../context/useAuth.jsx";
import Order from "../../../blocks/order/Order.jsx";

export default function OrderPage() {
    const [token, setToken] = useContext(UserContext);
    const {user} = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch(`/api/orders`, {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setOrders(data))
            .catch(console.error);
    }, [token]);

    const handleDelete = (id) => {
        if (!window.confirm("Удалить заказ?")) return;

        fetch(`/api/orders/${id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => {
                if (res.ok) {
                    setOrders((prev) => prev.filter((s) => s.id !== id));
                } else {
                    throw new Error("Ошибка при удалении");
                }
            })
            .catch((err) => alert(err.message));
    };


    return (
        <>
            <div className="grid md:grid-cols-4 gap-7 mb-4 md:pl-10 md:pr-10 md:pt-10">
                {orders.length === 0 ? (
                    <p className="text-gray-500">Нет заявок</p>
                ) : (
                    orders.map((order) => (
                        <Order key={order.id} order={order} onDelete={handleDelete} canDelete={["manager", "admin"].includes(user?.role?.name)}/>
                    ))
                )}
            </div>
        </>
    )
}