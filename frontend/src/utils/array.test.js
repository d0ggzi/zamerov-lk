import {describe, expect, it} from "vitest";
import {sameIdSet} from "./array.js";

describe("sameIdSet", () => {
    it("true для одинаковых множеств независимо от порядка", () => {
        expect(sameIdSet([1, 2, 3], [3, 2, 1])).toBe(true);
    });

    it("true при разнице в типах (число vs строка)", () => {
        expect(sameIdSet([1, 2], ["1", "2"])).toBe(true);
    });

    it("false при разной длине", () => {
        expect(sameIdSet([1, 2], [1, 2, 3])).toBe(false);
    });

    it("false при замене одного элемента (та же длина)", () => {
        // именно этот случай раньше пропускался проверкой по длине
        expect(sameIdSet([1, 2], [1, 3])).toBe(false);
    });

    it("true для двух пустых", () => {
        expect(sameIdSet([], [])).toBe(true);
    });
});
