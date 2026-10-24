import {describe, expect, it} from "vitest";
import {renderHook} from "@testing-library/react";
import {UserContext} from "./user-context.jsx";
import {useAuth} from "./useAuth.jsx";

// Собирает минимальный JWT (jwtDecode читает только payload, подпись не проверяется).
function makeToken(payload) {
    const b64 = (obj) => {
        const bytes = new TextEncoder().encode(JSON.stringify(obj));
        const bin = String.fromCharCode(...bytes);
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };
    return `${b64({alg: "HS256", typ: "JWT"})}.${b64(payload)}.sig`;
}

function wrapperFor(token) {
    return ({children}) => (
        <UserContext.Provider value={[token, () => {}]}>{children}</UserContext.Provider>
    );
}

describe("useAuth", () => {
    it("возвращает null-пользователя без токена", () => {
        const {result} = renderHook(() => useAuth(), {wrapper: wrapperFor(null)});
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isManager).toBe(false);
    });

    it("декодирует пользователя и определяет менеджера", () => {
        const token = makeToken({id: 1, name: "Иван", role: {name: "manager"}});
        const {result} = renderHook(() => useAuth(), {wrapper: wrapperFor(token)});

        expect(result.current.user.id).toBe(1);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isManager).toBe(true);
        expect(result.current.hasRole(["admin"])).toBe(false);
    });

    it("обычный пользователь не менеджер", () => {
        const token = makeToken({id: 2, role: {name: "user"}});
        const {result} = renderHook(() => useAuth(), {wrapper: wrapperFor(token)});
        expect(result.current.isManager).toBe(false);
    });

    it("не падает, если в токене нет роли", () => {
        const token = makeToken({id: 3});
        const {result} = renderHook(() => useAuth(), {wrapper: wrapperFor(token)});
        expect(result.current.hasRole(["admin"])).toBe(false);
        expect(result.current.isManager).toBe(false);
    });

    it("невалидный токен → null без выброса исключения", () => {
        const {result} = renderHook(() => useAuth(), {wrapper: wrapperFor("not-a-jwt")});
        expect(result.current.user).toBeNull();
    });
});
