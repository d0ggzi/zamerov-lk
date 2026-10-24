import {describe, expect, it} from "vitest";
import {formatDateTime, toDatetimeLocal} from "./date.js";

describe("formatDateTime", () => {
    it("возвращает 'не задана' для пустого/невалидного значения", () => {
        expect(formatDateTime(null)).toBe("не задана");
        expect(formatDateTime(undefined)).toBe("не задана");
        expect(formatDateTime("не дата")).toBe("не задана");
    });

    it("форматирует дату и время по-русски (дд.мм.гггг, чч:мм)", () => {
        const out = formatDateTime("2026-06-13T14:30:00");
        expect(out).toMatch(/13\.06\.2026/);
        expect(out).toMatch(/14:30/);
    });
});

describe("toDatetimeLocal", () => {
    it("преобразует Date в строку YYYY-MM-DDTHH:MM (локальное время)", () => {
        const d = new Date(2026, 5, 13, 9, 5); // 13 июня 2026, 09:05 (локально)
        expect(toDatetimeLocal(d)).toBe("2026-06-13T09:05");
    });

    it("возвращает пустую строку для невалидной даты", () => {
        expect(toDatetimeLocal(new Date("nope"))).toBe("");
        expect(toDatetimeLocal(null)).toBe("");
    });

    it("совместимость туда-обратно с datetime-local", () => {
        const local = "2026-12-01T23:45";
        // браузер отдаёт такую строку → парсим как локальную дату → обратно та же строка
        expect(toDatetimeLocal(new Date(local))).toBe(local);
    });
});
