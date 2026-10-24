import {useContext, useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import {apiFetch} from "../../../api/client.js";
import {ORDER_STATUS_OPTIONS} from "../../../constants/Status.jsx";
import {formatDateTime, formatTime} from "../../../utils/date.js";
import {addDays, assignColumns, monthGridDays, sameDay, startOfDay, weekDays} from "../../../utils/calendar.js";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function CalendarPage() {
    const [token] = useContext(UserContext);
    const {user, isManager} = useAuth();

    const [orders, setOrders] = useState([]);
    const [view, setView] = useState("month"); // "month" | "week"
    const [cursor, setCursor] = useState(new Date());
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        apiFetch("/api/orders/calendar", {token})
            .then(setOrders)
            .catch(console.error);
    }, [token]);

    // Заказы по дням (ключ — начало дня в мс), внутри дня отсортированы по времени.
    const ordersByDay = useMemo(() => {
        const map = new Map();
        for (const o of orders) {
            if (!o.data) continue;
            const key = startOfDay(new Date(o.data)).getTime();
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(o);
        }
        for (const list of map.values()) {
            list.sort((a, b) => new Date(a.data) - new Date(b.data));
        }
        return map;
    }, [orders]);

    const ordersOn = (day) => ordersByDay.get(startOfDay(day).getTime()) ?? [];

    const days = view === "month" ? monthGridDays(cursor) : weekDays(cursor);
    const today = new Date();

    const move = (dir) => {
        setCursor((c) => view === "month"
            ? new Date(c.getFullYear(), c.getMonth() + dir, 1)
            : addDays(c, dir * 7));
    };

    const periodLabel = view === "month"
        ? cap(cursor.toLocaleDateString("ru-RU", {month: "long", year: "numeric"}))
        : (() => {
            const w = weekDays(cursor);
            const fmt = (d) => d.toLocaleDateString("ru-RU", {day: "2-digit", month: "2-digit"});
            return `${fmt(w[0])} – ${fmt(w[6])}`;
        })();

    const canEdit = (order) => isManager || order.employee?.id === user?.id;

    // Конец заказа: end_data, если задан и позже начала; иначе +1 час по умолчанию.
    const orderEnd = (o) => {
        const start = new Date(o.data);
        if (o.end_data) {
            const e = new Date(o.end_data);
            if (e > start) return e;
        }
        return new Date(start.getTime() + 60 * 60 * 1000);
    };

    const btn = "px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50";
    const toggle = (active) =>
        `px-3 py-1.5 text-sm ${active ? "bg-custom-black text-custom-yellow" : "bg-white text-gray-700 hover:bg-gray-50"}`;

    return (
        <div className="p-4 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <button type="button" className={btn} onClick={() => move(-1)} aria-label="Назад">←</button>
                <button type="button" className={btn} onClick={() => setCursor(new Date())}>Сегодня</button>
                <button type="button" className={btn} onClick={() => move(1)} aria-label="Вперёд">→</button>
                <span className="text-gray-700 ml-2">{periodLabel}</span>
                <div className="ml-auto inline-flex rounded border border-gray-300 overflow-hidden">
                    <button type="button" className={toggle(view === "month")} onClick={() => setView("month")}>
                        Месяц
                    </button>
                    <button type="button" className={toggle(view === "week")} onClick={() => setView("week")}>
                        Неделя
                    </button>
                </div>
            </div>

            {orders.length === 0 && (
                <p className="text-gray-500 mb-3">Нет заказов с датой</p>
            )}

            {view === "month" ? (
                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden">
                    {WEEKDAYS.map((w) => (
                        <div key={w} className="bg-gray-50 text-center text-xs text-gray-500 py-1">{w}</div>
                    ))}

                    {days.map((day) => {
                        const inMonth = day.getMonth() === cursor.getMonth();
                        const isToday = sameDay(day, today);
                        return (
                            <div
                                key={day.getTime()}
                                className={`bg-white p-1 min-h-24 overflow-y-auto ${inMonth ? "" : "bg-gray-50 text-gray-400"}`}
                            >
                                <div className={`text-xs mb-1 ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                                    {day.getDate()}
                                </div>
                                <div className="space-y-1">
                                    {ordersOn(day).map((o) => (
                                        <button
                                            key={o.id}
                                            type="button"
                                            onClick={() => setSelected(o)}
                                            title={`${formatTime(o.data)} ${o.address || ""}`}
                                            className="block w-full text-left text-xs rounded bg-blue-50 hover:bg-blue-100 text-blue-700 px-1 py-0.5 truncate"
                                        >
                                            {formatTime(o.data)} {o.address || "—"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <WeekTimeGrid days={days} today={today} ordersOn={ordersOn} orderEnd={orderEnd} onPick={setSelected}/>
            )}

            {selected && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-[min(100%-2rem,560px)] max-h-[90vh] overflow-auto p-5"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-700">Заказ</span>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                aria-label="Закрыть"
                                className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <p>Адрес: {selected.address || "-"}</p>
                            <p>Начало: {formatDateTime(selected.data)}</p>
                            {selected.end_data && <p>Окончание: {formatDateTime(selected.end_data)}</p>}
                            <p>Статус: {ORDER_STATUS_OPTIONS[selected.status] ?? selected.status ?? "-"}</p>
                            <p>Исполнитель: {selected.employee?.name || "не назначен"}</p>
                            <p>Услуги: {selected.services?.length ? selected.services.map((s) => s.name).join(", ") : "-"}</p>
                            {selected.description && <p>Описание: {selected.description}</p>}
                        </div>

                        {canEdit(selected) && (
                            <div className="flex flex-wrap gap-3 mt-4">
                                <Link to={`/orders/edit/${selected.id}`} className="text-sm text-blue-600 hover:underline">
                                    ✎ Редактировать
                                </Link>
                                <Link to={`/orders/chat/${selected.id}`} className="text-sm text-custom-blue hover:underline">
                                    💬 Чат
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const HOUR_PX = 48; // высота одного часа в пикселях

// Недельный вид как тайм-грид: слева часы, заказы — блоки от начала до конца.
function WeekTimeGrid({days, today, ordersOn, orderEnd, onPick}) {
    // Видимый диапазон часов: по умолчанию 8–20, расширяется под заказы недели.
    let startHour = 8;
    let endHour = 20;
    for (const day of days) {
        for (const o of ordersOn(day)) {
            const s = new Date(o.data);
            const e = orderEnd(o);
            startHour = Math.min(startHour, s.getHours());
            endHour = Math.max(endHour, e.getHours() + (e.getMinutes() > 0 ? 1 : 0));
        }
    }
    startHour = Math.max(0, startHour);
    endHour = Math.min(24, Math.max(endHour, startHour + 1));

    const hours = [];
    for (let h = startHour; h < endHour; h++) hours.push(h);
    const colHeight = hours.length * HOUR_PX;

    const dayHeader = (d) => d.toLocaleDateString("ru-RU", {weekday: "short", day: "2-digit", month: "2-digit"});

    return (
        <div className="overflow-auto border border-gray-200 rounded max-h-[75vh]">
            <div className="flex sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="w-14 shrink-0"/>
                {days.map((d) => (
                    <div
                        key={d.getTime()}
                        className={`flex-1 text-center text-xs py-1 ${sameDay(d, today) ? "text-blue-600" : "text-gray-500"}`}
                    >
                        {dayHeader(d)}
                    </div>
                ))}
            </div>

            <div className="flex">
                <div className="w-14 shrink-0">
                    {hours.map((h) => (
                        <div key={h} style={{height: HOUR_PX}} className="text-right pr-1 text-xs text-gray-400">
                            {String(h).padStart(2, "0")}:00
                        </div>
                    ))}
                </div>

                {days.map((day) => {
                    const events = ordersOn(day).map((o) => {
                        const s = new Date(o.data);
                        const e = orderEnd(o);
                        return {o, e, startMin: s.getHours() * 60 + s.getMinutes(), endMin: e.getHours() * 60 + e.getMinutes()};
                    });
                    const placed = assignColumns(events);
                    return (
                        <div key={day.getTime()} className="relative flex-1 border-l border-gray-100" style={{height: colHeight}}>
                            {hours.map((h) => (
                                <div key={h} style={{height: HOUR_PX}} className="border-t border-gray-100"/>
                            ))}
                            {placed.map(({o, e, startMin, endMin, col, cols}) => {
                                const top = Math.max(0, ((startMin - startHour * 60) / 60) * HOUR_PX);
                                const height = Math.max(((endMin - startMin) / 60) * HOUR_PX, 18);
                                const widthPct = 100 / cols;
                                return (
                                    <button
                                        key={o.id}
                                        type="button"
                                        onClick={() => onPick(o)}
                                        style={{
                                            top,
                                            height,
                                            left: `calc(${col * widthPct}% + 1px)`,
                                            width: `calc(${widthPct}% - 2px)`,
                                        }}
                                        title={`${formatTime(o.data)}–${formatTime(e)} ${o.address || ""}`}
                                        className="absolute overflow-hidden rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-1 py-0.5 text-left"
                                    >
                                        {formatTime(o.data)}–{formatTime(e)} {o.address || "—"}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
