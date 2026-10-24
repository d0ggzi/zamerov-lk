import {useContext, useEffect, useState} from "react";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import {apiFetch} from "../../../api/client.js";
import Chat from "../../blocks/chat/Chat.jsx";
import {REQUEST_STATUS_OPTIONS, ORDER_STATUS_OPTIONS} from "../../../constants/Status.jsx";

const CHAT_HEIGHT = "h-[calc(100vh-3.5rem)]";

function RoomItem({label, sub, isSelected, onClick}) {
    return (
        <button
            onClick={onClick}
            className={
                "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors " +
                (isSelected ? "bg-blue-50 border-l-4 border-l-custom-blue" : "border-l-4 border-l-transparent")
            }
        >
            <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
        </button>
    );
}

export default function ChatInboxPage() {
    const [token] = useContext(UserContext);
    const {user} = useAuth();
    const [rooms, setRooms] = useState([]);
    const [selected, setSelected] = useState(null);

    const isEmployee = user?.role?.name === "employee";

    useEffect(() => {
        if (!user) return;
        if (isEmployee) {
            apiFetch("/api/orders/", {token})
                .then(setRooms)
                .catch(console.error);
        } else {
            apiFetch(`/api/users/${user.id}/requests`, {token})
                .then(setRooms)
                .catch(console.error);
        }
    }, [token, user, isEmployee]);

    function roomLabel(room) {
        if (isEmployee) {
            return room.address || room.description || `Заказ ${room.id.slice(0, 8)}`;
        }
        return room.description || room.address || `Заявка ${room.id.slice(0, 8)}`;
    }

    function roomSub(room) {
        if (isEmployee) {
            return ORDER_STATUS_OPTIONS[room.status] ?? room.status;
        }
        return REQUEST_STATUS_OPTIONS[room.status] ?? room.status;
    }

    function roomTitle(room) {
        if (isEmployee) return `Заказ: ${room.address || room.id.slice(0, 8)}`;
        return `Заявка: ${room.description || room.address || room.id.slice(0, 8)}`;
    }

    return (
        <div className={`flex ${CHAT_HEIGHT} -m-4`}>
            <aside className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 shrink-0">
                    <h2 className="font-semibold text-gray-800 text-sm">
                        {isEmployee ? "Мои заказы" : "Мои заявки"}
                    </h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    {rooms.length === 0 ? (
                        <p className="text-sm text-gray-400 p-4">Нет доступных чатов</p>
                    ) : (
                        rooms.map((room) => (
                            <RoomItem
                                key={room.id}
                                label={roomLabel(room)}
                                sub={roomSub(room)}
                                isSelected={selected?.id === room.id}
                                onClick={() => setSelected({id: room.id, title: roomTitle(room)})}
                            />
                        ))
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {selected ? (
                    <Chat
                        roomId={selected.id}
                        title={selected.title}
                        className={`${CHAT_HEIGHT} rounded-none shadow-none border-0`}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/>
                        </svg>
                        <p className="text-sm">Выберите чат слева</p>
                    </div>
                )}
            </div>
        </div>
    );
}
