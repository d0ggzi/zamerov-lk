import {cellText, smallCellBlock} from "./styles.js";

export default function Service({service, onDelete, canDelete}) {
    return (
        <div className={`${smallCellBlock} relative group`}>
            <p className={cellText}>{service?.name}</p>
            {canDelete && (
                <button
                    onClick={() => onDelete(service.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить услугу"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                         className="w-5 h-5 text-red-600 hover:text-red-800 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"/>
                    </svg>
                </button>
            )}
        </div>
    );
}
