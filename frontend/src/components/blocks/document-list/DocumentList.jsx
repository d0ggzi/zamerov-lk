import {DOCUMENT_STATUS_OPTIONS} from "../../../constants/Status.jsx";

// Бейдж статуса документа.
function StatusBadge({status}) {
    const label = DOCUMENT_STATUS_OPTIONS[status] ?? status;
    const cls = status === "SIGNED"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600";
    return <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// Список документов: ссылка на скачивание, статус + (опционально) кнопки "Подписать"/"Удалить".
export default function DocumentList({documents = [], onSign, onDelete, emptyText = "Документов пока нет"}) {
    if (documents.length === 0) {
        return <p className="text-sm text-gray-500">{emptyText}</p>;
    }

    return (
        <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
                <li key={doc.id ?? doc.url} className="flex items-center justify-between gap-3 py-2">
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
                    <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={doc.status}/>
                        {onSign && doc.status !== "SIGNED" && (
                            <button
                                type="button"
                                onClick={() => onSign(doc)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                title="Подписать документ"
                            >
                                Подписать
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(doc)}
                                className="text-xs text-red-600 hover:text-red-800"
                                title="Удалить документ"
                            >
                                Удалить
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
