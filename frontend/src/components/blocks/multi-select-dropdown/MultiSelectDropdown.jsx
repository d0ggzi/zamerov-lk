import {useState, useRef, useEffect} from "react";

function MultiSelectDropdown({options, selected, setSelected}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // id сравниваем как строки, чтобы не зависеть от того, пришли они числами
    // (со страниц редактирования) или строками (при создании).
    const isSelected = (id) => selected.some((val) => String(val) === String(id));

    const toggleSelect = (id) => {
        setSelected((prev) =>
            isSelected(id)
                ? prev.filter((val) => String(val) !== String(id))
                : [...prev, id]
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative mb-4" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border rounded p-2 text-left bg-white"
            >
                {selected.length > 0
                    ? `${selected.length} выбрано`
                    : "Выберите услуги"}
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {options.map((s) => (
                        <label
                            key={s.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                value={s.id}
                                checked={isSelected(s.id)}
                                onChange={() => toggleSelect(s.id)}
                                className="mr-2"
                            />
                            {s.name}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MultiSelectDropdown;