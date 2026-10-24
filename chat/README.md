# Chat — WebSocket microservice

Отдельный Go-сервис для чата в реальном времени. Комнаты чата привязаны к заявкам (`Request`) основного backend-а: `room_id` — это UUID заявки.

Сервис валидирует JWT-токены самостоятельно, используя общий `JWT_SECRET`. Обращаться к Python backend-у для авторизации не нужно.

---

## Переменные окружения

Все переменные находятся в одном файле `.env`. Файл `.env.example` содержит шаблон с описанием каждой переме��ной.

| Переменная | По умолчанию | Описание |
|---|---|---|
| `JWT_SECRET` | — | **Обязательная.** Должна совпадать с `JWT_SECRET` в `backend/.env` |
| `CHAT_PORT` | `8090` | Порт HTTP-сервера |
| `CHAT_POSTGRES_HOST` | `localhost` | Хост PostgreSQL |
| `CHAT_POSTGRES_PORT` | `5432` | Порт PostgreSQL |
| `CHAT_POSTGRES_USER` | `postgres` | Пользователь PostgreSQL |
| `CHAT_POSTGRES_PASSWORD` | _(пусто)_ | Пароль PostgreSQL |
| `CHAT_POSTGRES_DB` | `chat` | Имя базы данных |
| `CHAT_TEST_DSN` | _(пусто)_ | DSN для интеграционных т��стов. Если не задан, тесты пропускаются |

---

## Быстрый старт

### 1. Подготовка `.env`

```bash
cp .env.example .env
```

Откройте `.env` и установите `JWT_SECRET` — значение должно совпадать с тем, что указано в `backend/.env`.

---

## Запуск через Docker Compose (рекомендуется)

Docker Compose автоматически поднимает сервис и отдельную PostgreSQL-базу для чата.

```bash
docker-compose up --build
```

Сервис бу��ет доступен на `http://localhost:8090`.

Чтобы запустить в фоне:

```bash
docker-compose up --build -d
```

Остановить и удалить контейнеры:

```bash
docker-compose down
```

Удалить также том с данными базы:

```bash
docker-compose down -v
```

> **Примечание про хост базы данных.**
> В `.env` задан `CHAT_POSTGRES_HOST=localhost` — это значение используется при локальном запуске бинарника.
> Docker Compose автоматически переопределяет его на `chat-db` (имя контейнера с базой), поэтому менять `.env` для запуска через Docker не нужно.

---

## Локальный запуск (без Docker)

Требования: Go ≥ 1.22, работающий PostgreSQL.

### 1. Создать базу данн��х

```bash
psql -U postgres -c "CREATE USER chat WITH PASSWORD 'chat';"
psql -U postgres -c "CREATE DATABASE chat OWNER chat;"
```

### 2. Настроить `.env`

Убедитесь, что в `.env` указаны корректные значения для вашего локального PostgreSQL:

```env
CHAT_POSTGRES_HOST=localhost
CHAT_POSTGRES_PORT=5432
CHAT_POSTGRES_USER=chat
CHAT_POSTGRES_PASSWORD=chat
CHAT_POSTGRES_DB=chat
JWT_SECRET=<значение из backend/.env>
```

### 3. Запустить сервис

```bash
# Экспортировать переменные из .env и запустить
export $(grep -v '^#' .env | xargs) && go run ./cmd/chat
```

Или через скомпилированный бинарник:

```bash
go build -o chat ./cmd/chat
export $(grep -v '^#' .env | xargs) && ./chat
```

---

## Миграции

Миграции **запускаются автомати��ески при каждом старте сервиса** — отдельной команды нет.

При первом запуске сервис создаёт таблицу `messages` и индекс `idx_messages_room_created`. Запросы идемпотентны (`CREATE TABLE IF NOT EXISTS`), поэтому повторный запуск безопасен.

Схема базы данных:

```sql
CREATE TABLE messages (
    id          UUID        PRIMARY KEY,
    room_id     UUID        NOT NULL,       -- соответствует UUID заявки (Request)
    sender_id   TEXT        NOT NULL,       -- UUID пользователя из JWT
    sender_name TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_messages_room_created ON messages (room_id, created_at DESC);
```

---

## Тесты

Тесты разделены на два типа:

- **Компиляционные** — проверяют корректность кода, запускаются всегда.
- **Интеграционные** — работают с реальной базой данных, запускаются только при наличии `CHAT_TEST_DSN`.

### Запустить все тесты (включая интеграционные)

```bash
export CHAT_TEST_DSN="host=localhost port=5432 user=chat password=chat dbname=chat sslmode=disable"
go test ./...
```

### Запустить только компиляционные тесты (без БД)

```bash
go test ./...
# Интеграционные тесты будут автоматически пропущены (SKIP)
```

### Запустить тесты одного пакета

```bash
export CHAT_TEST_DSN="..."
go test ./internal/repository/...
go test ./internal/handler/...
```

### Запустить конкретный тест

```bash
export CHAT_TEST_DSN="..."
go test ./internal/handler/... -run TestWebSocket_SendReceive -v
```

### Что покрывают тесты

| Тест | Пакет | Что проверяет |
|---|---|---|
| `TestSave_andList` | `repository` | Сохранение и получение сообщений, порядок, `limit`, cursor-пагинация, пустая комната |
| `TestListMessages_Unauthorized` | `handler` | REST-эндпоинт отклоняет запрос без токена (401) |
| `TestListMessages_InvalidToken` | `handler` | REST-эндпоинт отклоняет неверный JWT (401) |
| `TestListMessages_OK` | `handler` | REST-эндпоинт возвращает сохранённые сообщения |
| `TestWebSocket_SendReceive` | `handler` | Сообщение от клиента A получает клиент B в той же комнате |
| `TestWebSocket_Unauthorized` | `handler` | WS-handshake с неверным токеном отклоняется (401) |
| `TestWebSocket_MessagePersistedToDB` | `handler` | Сообщение, отправленное через WS, сохраняется в БД |

---

## API

### `GET /api/chat/rooms/{room_id}/messages`

Возвращает историю сообщений комнаты в хронологическом порядке (от старых к новым).

**Заголовки:**
```
Authorization: Bearer <jwt>
```

**Query-параметры:**

| Параметр | Тип | Описание |
|---|---|---|
| `limit` | int | Количество сообщений (по умол��анию 50, максимум 100) |
| `before` | RFC3339 | Курсор пагинации: вернуть сообщения старше указанного времени |

**Пример — загрузить последние 50 сообщений:**
```
GET /api/chat/rooms/550e8400-e29b-41d4-a716-446655440000/messages
```

**Пример — подгрузить предыдущую страницу (scroll up):**
```
GET /api/chat/rooms/550e8400-e29b-41d4-a716-446655440000/messages?before=2024-06-01T10:00:00.000Z&limit=50
```

**Ответ:**
```json
[
  {
    "id": "...",
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "user-uuid",
    "sender_name": "Иван",
    "content": "Привет",
    "created_at": "2024-06-01T10:00:00Z"
  }
]
```

---

### `GET /api/chat/ws/{room_id}?token=<jwt>`

WebSocket-соединение для получения и отправки ��ообщений в реальном времени.

Токен передаётся через query-параметр `token`, а не через заголовок — браузерный WebSocket API не позволяет устанавливать заголовки при установке соединения.

**Входящее сообщение (клиент → сервер):**
```json
{ "content": "Текст сообщения" }
```

**Исходящее сообщение (сервер → клиент):** формат совпадает с объектом из REST-эндпоинта, рассылается всем участникам ��омнаты.

**Пример подключения на фронтенде:**
```js
const token = localStorage.getItem('awesomeLeadsToken');
const roomId = requestId; // UUID заявки

const ws = new WebSocket(`/api/chat/ws/${roomId}?token=${token}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message.sender_name, ':', message.content);
};

ws.send(JSON.stringify({ content: 'Привет!' }));
```

---

## Архитектура

```
handler (HTTP + WS)
    │
    ├─► hub (in-memory pub/sub)
    │      Единственная горутина Run() владеет картой rooms.
    │      Клиенты общаются через каналы reg/unreg/broadcast.
    │
    └─► repository (PostgreSQL через pgx)
           Save  — сохранить сообщение
           List  — история с cursor-пагинацие��
```

Каждое WebSocket-соединение — это два горутины: `ReadPump` (чтение из WS → сохранение в БД → broadcast) и `WritePump` (запись из канала `Send` → WS + ping-pong keepalive).
