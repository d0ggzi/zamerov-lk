import {describe, expect, it} from "vitest";
import {orderTitle} from "./order.js";

describe("orderTitle", () => {
    it("совмещает адрес и дату", () => {
        const out = orderTitle({address: "ул. Ленина, 5", data: "2026-06-13T14:30:00"});
        expect(out).toMatch(/ул\. Ленина, 5/);
        expect(out).toMatch(/13\.06\.2026/);
        expect(out).toContain(" — ");
    });

    it("только адрес, если нет даты", () => {
        expect(orderTitle({address: "ул. Ленина, 5", data: null})).toBe("ул. Ленина, 5");
    });

    it("только дата, если нет адреса", () => {
        expect(orderTitle({address: "", data: "2026-06-13T14:30:00"})).toMatch(/13\.06\.2026/);
    });

    it("заглушка, если нет ни адреса, ни даты", () => {
        expect(orderTitle({address: "", data: null})).toBe("Заказ без адреса и даты");
    });

    it("заглушка для пустого заказа", () => {
        expect(orderTitle(null)).toBe("Заказ");
    });
});
