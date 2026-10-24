import {describe, it, expect, vi, afterEach, beforeEach} from "vitest";
import {renderHook, act, waitFor} from "@testing-library/react";
import {useChat} from "./useChat.js";
import {UserContext} from "../context/user-context.jsx";

// Минимальный mock WebSocket — имитирует браузерное API.
class MockWebSocket {
    static _instances = [];

    constructor(url) {
        this.url = url;
        this.readyState = MockWebSocket.OPEN;
        this._sent = [];
        MockWebSocket._instances.push(this);
        // Имитируем асинхронный onopen как в реальном WS.
        Promise.resolve().then(() => this.onopen?.());
    }

    send(data) {
        this._sent.push(data);
    }

    close() {
        this.readyState = MockWebSocket.CLOSED;
        this.onclose?.({wasClean: true});
    }

    static get OPEN() { return 1; }
    static get CONNECTING() { return 0; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }
}

function wrapper({children}) {
    return (
        <UserContext.Provider value={["test-token", () => {}]}>
            {children}
        </UserContext.Provider>
    );
}

beforeEach(() => {
    MockWebSocket._instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
    vi.restoreAllMocks();
    MockWebSocket._instances = [];
});

describe("useChat", () => {
    it("загружает историю сообщений при монтировании", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify([{id: "1", content: "привет", sender_name: "Алиса", sender_id: "u1"}]),
                {headers: {"content-type": "application/json"}},
            )
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});

        await waitFor(() => expect(result.current.messages).toHaveLength(1));
        expect(result.current.messages[0].content).toBe("привет");
    });

    it("добавляет входящее WS-сообщение к списку", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response("[]", {headers: {"content-type": "application/json"}})
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});
        await waitFor(() => expect(MockWebSocket._instances).toHaveLength(1));

        act(() => {
            MockWebSocket._instances[0].onmessage?.({
                data: JSON.stringify({id: "2", content: "ws-сообщение", sender_name: "Боб", sender_id: "u2"}),
            });
        });

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].content).toBe("ws-сообщение");
    });

    it("send() передаёт JSON-строку через ws.send", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response("[]", {headers: {"content-type": "application/json"}})
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});
        await waitFor(() => expect(MockWebSocket._instances).toHaveLength(1));

        act(() => {
            result.current.send("hello");
        });

        expect(MockWebSocket._instances[0]._sent).toEqual([JSON.stringify({content: "hello"})]);
    });

    it("не открывает соединение и не вызывает fetch, если roomId не задан", () => {
        vi.stubGlobal("fetch", vi.fn());

        renderHook(() => useChat(null), {wrapper});

        expect(MockWebSocket._instances).toHaveLength(0);
        expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    });

    it("устанавливает connected=true после открытия сокета", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response("[]", {headers: {"content-type": "application/json"}})
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});

        await waitFor(() => expect(result.current.connected).toBe(true));
    });

    it("устанавливает connected=false при закрытии сокета", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response("[]", {headers: {"content-type": "application/json"}})
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});
        await waitFor(() => expect(result.current.connected).toBe(true));

        act(() => {
            MockWebSocket._instances[0].close();
        });

        expect(result.current.connected).toBe(false);
    });

    it("история и WS-сообщения складываются вместе", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify([{id: "h1", content: "из истории", sender_name: "Алиса", sender_id: "u1"}]),
                {headers: {"content-type": "application/json"}},
            )
        ));

        const {result} = renderHook(() => useChat("room-uuid"), {wrapper});
        await waitFor(() => expect(result.current.messages).toHaveLength(1));

        act(() => {
            MockWebSocket._instances[0].onmessage?.({
                data: JSON.stringify({id: "w1", content: "из сокета", sender_name: "Боб", sender_id: "u2"}),
            });
        });

        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[1].content).toBe("из сокета");
    });
});
