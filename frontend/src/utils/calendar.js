// Чистые помощники для календарной сетки (без сторонних библиотек).
// Неделя начинается с понедельника.

export function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

export function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

// Понедельник недели, содержащей date.
export function startOfWeek(date) {
    const d = startOfDay(date);
    const dow = (d.getDay() + 6) % 7; // Пн=0 … Вс=6
    return addDays(d, -dow);
}

// 7 дат недели (Пн…Вс), содержащей date.
export function weekDays(date) {
    const start = startOfWeek(date);
    return Array.from({length: 7}, (_, i) => addDays(start, i));
}

// 42 даты (6 недель) для месячной сетки: начинается с понедельника
// недели, в которую попадает 1-е число месяца.
export function monthGridDays(date) {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = startOfWeek(firstOfMonth);
    return Array.from({length: 42}, (_, i) => addDays(start, i));
}

// Раскладка пересекающихся по времени событий по колонкам (как в календарях).
// Вход: массив событий с числовыми {startMin, endMin}. Возвращает новые объекты
// (отсортированные по началу) с добавленными `col` (индекс колонки) и `cols`
// (число колонок в группе пересечения) — для вычисления ширины/смещения блока.
export function assignColumns(events) {
    const sorted = [...events].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    const out = [];
    let group = [];
    let colEnds = []; // время окончания последнего события в каждой колонке группы

    const flush = () => {
        const cols = colEnds.length;
        for (const item of group) item.cols = cols;
        group = [];
        colEnds = [];
    };

    for (const ev of sorted) {
        // событие не пересекается ни с чем в текущей группе → закрываем группу
        if (colEnds.length && ev.startMin >= Math.max(...colEnds)) flush();

        let col = colEnds.findIndex((end) => end <= ev.startMin);
        if (col === -1) {
            col = colEnds.length;
            colEnds.push(ev.endMin);
        } else {
            colEnds[col] = ev.endMin;
        }

        const item = {...ev, col, cols: 1};
        group.push(item);
        out.push(item);
    }
    flush();
    return out;
}
