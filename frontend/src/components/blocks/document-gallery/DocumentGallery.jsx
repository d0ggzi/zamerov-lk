import {useEffect, useRef} from "react";
import DocumentList from "../document-list/DocumentList.jsx";
import UploadDocument from "../upload-document/UploadDocument.jsx";

// Модалка документов заказа — аналог ImageGallery для фото:
// просмотр/скачивание, а также (опционально) удаление и загрузка.
export default function DocumentGallery({documents = [], isOpen = false, onClose, onSign, onDelete, onUpload}) {
    useEffect(() => {
        if (!isOpen) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    // Закрытие по клику вне контента
    const contentRef = useRef(null);
    const onBackdropClick = (e) => {
        if (contentRef.current && !contentRef.current.contains(e.target)) onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center
                 bg-black/20 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onMouseDown={onBackdropClick}
        >
            <div
                ref={contentRef}
                className="relative bg-white rounded-2xl shadow-xl w-[min(100%-2rem,700px)] max-h-[90vh] overflow-auto p-4"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Документы заказа</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                        aria-label="Закрыть"
                        title="Закрыть"
                    >
                        ✖
                    </button>
                </div>

                <DocumentList documents={documents} onSign={onSign} onDelete={onDelete}/>

                {onUpload && <UploadDocument onUploadSuccess={onUpload}/>}
            </div>
        </div>
    );
}
