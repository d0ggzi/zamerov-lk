import {useContext, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {buttonPrimary, inputStyle} from "../../../themes/default.js";
import {ORDER_STATUS_OPTIONS} from "../../../../constants/Status.jsx";
import MultiSelectDropdown from "../../../blocks/multi-select-dropdown/MultiSelectDropdown.jsx";
import {UserContext} from "../../../../context/user-context.jsx";
import {DatePicker} from "../../../blocks/datepicker/Datepicker.jsx";
import TimePicker24 from "../../../blocks/timepicker/TimePicker.jsx";
import UploadPhoto from "../../../blocks/upload-photo/UploadPhoto.jsx";

export default function OrderEditPage() {
    const {id} = useParams();
    const [token] = useContext(UserContext);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("");

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const [date, setDate] = useState(new Date());

    useEffect(() => {
        fetch(`/api/orders/${id}`, {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => {
                setOrder(data);
                setDescription(data.description || "");
                setAddress(data.address || "");
                setStatus(data.status || "");
                setSelectedEmployee(data.employee?.id || null);
                setSelectedServices(data.services ? data.services.map(service => service.id) : []);
                setDate(new Date(data.data));
            })
            .catch(console.error);
    }, [id, token]);

    useEffect(() => {
        fetch("/api/services/", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setServices(data))
            .catch(console.error);
    }, [token]);

    useEffect(() => {
        fetch("/api/users?role=employee", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch(console.error);
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFields = {};
        if (description !== (order.description || "")) {
            updatedFields.description = description;
        }
        if (address !== (order.address || "")) {
            updatedFields.address = address;
        }
        if (status !== (order.status || "")) {
            updatedFields.status = status;
        }
        if (selectedEmployee !== order.employee?.id) {
            updatedFields.employee_id = selectedEmployee;
        }
        if (selectedServices.length !== order.services.length) {
            updatedFields.services_ids = selectedServices;
        }
        if (date.toISOString() !== new Date(order.data).toISOString()) {
            updatedFields.data = date.toISOString();
        }

        if (Object.keys(updatedFields).length === 0) {
            alert("Нет изменений для сохранения");
            return;
        }

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH", headers: {
                    "Content-Type": "application/json", Authorization: `Bearer ${token}`,
                }, body: JSON.stringify(updatedFields),
            });
            if (!res.ok) throw new Error("Ошибка обновления заказа");
            navigate("/orders");
        } catch (err) {
            alert(err.message);
        }
    };

    if (!order) return <p className="p-6">Загрузка...</p>;

    return (<div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Редактировать заказ</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputStyle}
            />
            <input
                type="text"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputStyle}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyle}>
                <option value="">-- статус --</option>
                {Object.entries(ORDER_STATUS_OPTIONS).map(([value, label]) => (<option key={value} value={value}>
                    {label}
                </option>))}
            </select>

            <MultiSelectDropdown
                options={services}
                selected={selectedServices}
                setSelected={setSelectedServices}
            />

            <select
                value={selectedEmployee ?? "null"}
                onChange={(e) => setSelectedEmployee(e.target.value === "null" ? null : e.target.value)}
                className={inputStyle}
            >
                <option value="null">-- Без исполнителя --</option>
                {employees.map((employee) => (<option key={employee.id} value={employee.id}>
                    {employee.name}
                </option>))}
            </select>

            <div className="flex justify-between">
                <DatePicker date={date} setDate={setDate}/>
                <TimePicker24 date={date} setDate={setDate}/>
            </div>

            <UploadPhoto orderId={order.id}/>

            <button type="submit" className={buttonPrimary}>Сохранить</button>
        </form>
    </div>);
}
