import {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../../context/user-context.jsx";
import {useAuth} from "../../../context/useAuth.jsx";
import {apiFetch} from "../../../api/client.js";
import {DOCUMENT_STATUS_OPTIONS} from "../../../constants/Status.jsx";

export default function DocumentsPage() {
    const [token] = useContext(UserContext);
    const {isManager} = useAuth();
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        apiFetch("/api/documents", {token})
            .then(setDocuments)
            .catch(console.error);
    }, [token]);

    const handleDelete = async (doc) => {
        if (!window.confirm(`Удалить документ «${doc.name}»?`)) return;
        const prev = documents;
        setDocuments((cur) => cur.filter((d) => d.id !== doc.id));
        try {
            await apiFetch(`/api/documents/${doc.id}`, {token, method: "DELETE"});
        } catch (e) {
            console.error(e);
            setDocuments(prev);
            alert("Не удалось удалить документ.");
        }
    };

    // "Подписание" — заглушка: реальной ЭЦП нет, кнопка просто переводит статус в "Подписан".
    const handleSign = async (doc) => {
        const prev = documents;
        setDocuments((cur) => cur.map((d) => (d.id === doc.id ? {...d, status: "SIGNED"} : d)));
        try {
            await apiFetch(`/api/documents/${doc.id}`, {token, method: "PATCH", body: {status: "SIGNED"}});
        } catch (e) {
            console.error(e);
            setDocuments(prev);
            alert("Не удалось подписать документ.");
        }
    };

    return (
        <div className="p-4 md:p-10">
            <h1 className="text-xl mb-6">Документы</h1>

            {documents.length === 0 ? (
                <p className="text-gray-500">Документов пока нет</p>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white p-4 rounded shadow flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline truncate"
                                    title={doc.name}
                                >
                                    <span aria-hidden="true">📄</span>
                                    <span className="truncate">{doc.name}</span>
                                </a>
                                {isManager && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(doc)}
                                        className="shrink-0 text-xs text-red-600 hover:text-red-800"
                                        title="Удалить документ"
                                    >
                                        Удалить
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                        doc.status === "SIGNED"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {DOCUMENT_STATUS_OPTIONS[doc.status] ?? doc.status}
                                </span>
                                {isManager && doc.status !== "SIGNED" && (
                                    <button
                                        type="button"
                                        onClick={() => handleSign(doc)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        title="Подписать документ"
                                    >
                                        Подписать
                                    </button>
                                )}
                            </div>
                            <Link
                                to={`/orders/${doc.order_id}`}
                                className="text-sm text-blue-600 hover:underline mt-auto pt-2 border-t border-gray-100"
                            >
                                Открыть заказ →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
