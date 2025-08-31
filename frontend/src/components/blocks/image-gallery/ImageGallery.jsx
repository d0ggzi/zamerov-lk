import { useEffect, useRef } from "react";

export default function ImageGallery({ images = [], isOpen = false, onClose, onRemove }) {
  // Если модалка не открыта — ничего не рисуем
  if (!isOpen) return null;

  // Лочим скролл body при открытии
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Закрытие по клику вне контента
  const contentRef = useRef(null);
  const onBackdropClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center
                 bg-black/20 backdrop-blur-sm"   // ← мягкое затемнение + блюр фона
      role="dialog"
      aria-modal="true"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={contentRef}
        className="relative bg-white rounded-2xl shadow-xl w-[min(100%-2rem,1100px)] max-h-[90vh] overflow-auto p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Фотографии заказа</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
            aria-label="Закрыть"
            title="Закрыть"
          >
            ✖
          </button>
        </div>

        {/* Галерея */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, i) => (
            <figure key={image.id ?? image.url ?? i} className="relative group">
              <img
                className="w-full h-auto rounded-lg"
                src={image.url}
                alt=""
                draggable={false}
              />
              {/* удалить */}
              {onRemove && (
                <button
                  onClick={() => onRemove(image)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1
                             opacity-0 group-hover:opacity-100 transition"
                  title="Удалить фото"
                >
                  Удалить
                </button>
              )}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
