// Тонкая обёртка над fetch для обращений к backend (`/api/*` проксируется Vite).
// Единая точка для авторизации, сериализации JSON, проверки статуса и парсинга ответа.

export class ApiError extends Error {
    constructor(status, message) {
        super(message || `Запрос завершился с ошибкой (${status})`);
        this.name = "ApiError";
        this.status = status;
    }
}

/**
 * @param {string} path  путь вида "/api/requests/"
 * @param {object} [opts]
 * @param {string|null} [opts.token]   JWT; если задан — уходит в заголовок Authorization
 * @param {string} [opts.method]       HTTP-метод (по умолчанию GET)
 * @param {*} [opts.body]              объект → отправится как JSON; URLSearchParams/FormData/строка — как есть
 * @returns {Promise<*>}  распарсенный JSON, либо null для пустого ответа (204)
 */
export async function apiFetch(path, {token, method = "GET", body, headers, ...rest} = {}) {
    const finalHeaders = {...headers};
    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    let payload = body;
    const isRaw =
        body == null ||
        typeof body === "string" ||
        body instanceof FormData ||
        body instanceof URLSearchParams;
    if (!isRaw) {
        finalHeaders["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
    }

    const response = await fetch(path, {method, headers: finalHeaders, body: payload, ...rest});

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new ApiError(response.status, text);
    }

    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : response.text();
}
