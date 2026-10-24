import {describe, expect, it} from "vitest";
import {addDays, sameDay, startOfWeek, weekDays, monthGridDays, assignColumns} from "./calendar.js";

describe("calendar utils", () => {
    it("addDays сдвигает дату", () => {
        expect(addDays(new Date(2026, 5, 13), 2)).toEqual(new Date(2026, 5, 15));
    });

    it("sameDay игнорирует время", () => {
        expect(sameDay(new Date(2026, 5, 13, 9), new Date(2026, 5, 13, 23))).toBe(true);
        expect(sameDay(new Date(2026, 5, 13), new Date(2026, 5, 14))).toBe(false);
    });

    it("startOfWeek возвращает понедельник", () => {
        // 13 июня 2026 — суббота → понедельник 8 июня
        const monday = startOfWeek(new Date(2026, 5, 13));
        expect(monday.getDay()).toBe(1);
        expect(monday.getDate()).toBe(8);
    });

    it("weekDays — 7 дней с понедельника", () => {
        const days = weekDays(new Date(2026, 5, 13));
        expect(days).toHaveLength(7);
        expect(days[0].getDay()).toBe(1); // Пн
        expect(days[6].getDay()).toBe(0); // Вс
    });

    it("monthGridDays — 42 дня, начинается с понедельника", () => {
        const days = monthGridDays(new Date(2026, 5, 1));
        expect(days).toHaveLength(42);
        expect(days[0].getDay()).toBe(1);
    });
});

describe("assignColumns", () => {
    it("непересекающиеся события — одна колонка", () => {
        const out = assignColumns([
            {startMin: 600, endMin: 660},
            {startMin: 700, endMin: 760},
        ]);
        expect(out.every((e) => e.cols === 1 && e.col === 0)).toBe(true);
    });

    it("два пересекающихся — две колонки рядом", () => {
        const out = assignColumns([
            {startMin: 600, endMin: 720}, // 10:00–12:00
            {startMin: 660, endMin: 780}, // 11:00–13:00
        ]);
        expect(out.map((e) => e.cols)).toEqual([2, 2]);
        expect(out.map((e) => e.col)).toEqual([0, 1]);
    });

    it("касание (конец == начало) не считается пересечением", () => {
        const out = assignColumns([
            {startMin: 600, endMin: 660},
            {startMin: 660, endMin: 720},
        ]);
        expect(out.every((e) => e.cols === 1)).toBe(true);
    });

    it("третье событие после пары образует отдельную группу", () => {
        const out = assignColumns([
            {startMin: 600, endMin: 720},
            {startMin: 660, endMin: 780},
            {startMin: 800, endMin: 860},
        ]);
        const last = out.find((e) => e.startMin === 800);
        expect(last.cols).toBe(1);
        expect(last.col).toBe(0);
    });
});
