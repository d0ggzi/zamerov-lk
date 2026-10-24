import {afterEach, describe, expect, it, vi} from "vitest";
import {apiFetch, ApiError} from "./client.js";

afterEach(() => {
    vi.restoreAllMocks();
});

function mockFetch(response) {
    const spy = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", spy);
    return spy;
}

describe("apiFetch", () => {
    it("добавляет заголовок Authorization, когда передан токен", async () => {
        const spy = mockFetch(new Response("[]", {headers: {"content-type": "application/json"}}));

        await apiFetch("/api/services/", {token: "abc"});

        const [, options] = spy.mock.calls[0];
        expect(options.headers.Authorization).toBe("Bearer abc");
    });

    it("сериализует объект в JSON и выставляет content-type", async () => {
        const spy = mockFetch(new Response(null, {status: 204}));

        await apiFetch("/api/requests/", {method: "POST", body: {name: "x"}});

        const [, options] = spy.mock.calls[0];
        expect(options.headers["Content-Type"]).toBe("application/json");
        expect(options.body).toBe(JSON.stringify({name: "x"}));
    });

    it("не трогает URLSearchParams (отдаёт как есть)", async () => {
        const spy = mockFetch(new Response("{}", {headers: {"content-type": "application/json"}}));
        const params = new URLSearchParams({username: "a"});

        await apiFetch("/api/auth/token", {method: "POST", body: params});

        const [, options] = spy.mock.calls[0];
        expect(options.body).toBe(params);
        expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("бросает ApiError со статусом при !ok", async () => {
        mockFetch(new Response("boom", {status: 403}));

        await expect(apiFetch("/api/x")).rejects.toMatchObject({
            name: "ApiError",
            status: 403,
        });
    });

    it("возвращает null для ответа 204", async () => {
        mockFetch(new Response(null, {status: 204}));

        await expect(apiFetch("/api/x", {method: "DELETE"})).resolves.toBeNull();
    });

    it("парсит JSON-ответ", async () => {
        mockFetch(new Response(JSON.stringify([{id: 1}]), {headers: {"content-type": "application/json"}}));

        await expect(apiFetch("/api/services/")).resolves.toEqual([{id: 1}]);
    });
});

describe("ApiError", () => {
    it("содержит статус и сообщение", () => {
        const err = new ApiError(500, "fail");
        expect(err).toBeInstanceOf(Error);
        expect(err.status).toBe(500);
        expect(err.message).toBe("fail");
    });
});
