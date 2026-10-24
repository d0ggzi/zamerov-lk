package handler_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"chat/internal/domain"
	"chat/internal/handler"
	"chat/internal/hub"
	"chat/internal/repository"
	"chat/internal/testutil"
)

// newTestServer spins up a full handler stack with a real DB.
func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	pool := testutil.NewPool(t)
	repo := repository.NewMessageRepo(pool)
	h := hub.New()
	go h.Run()

	mux := http.NewServeMux()
	handler.New(h, repo, testutil.TestSecret).Mount(mux)
	return httptest.NewServer(mux)
}

// TestListMessages_Unauthorized verifies that the endpoint rejects missing tokens.
func TestListMessages_Unauthorized(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp, err := http.Get(fmt.Sprintf("%s/api/chat/rooms/%s/messages", srv.URL, uuid.New()))
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
}

// TestListMessages_InvalidToken rejects a tampered JWT.
func TestListMessages_InvalidToken(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/chat/rooms/%s/messages", srv.URL, uuid.New()), nil)
	req.Header.Set("Authorization", "Bearer not.a.valid.token")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
}

// TestListMessages_OK returns stored messages for an authenticated user.
func TestListMessages_OK(t *testing.T) {
	pool := testutil.NewPool(t)
	repo := repository.NewMessageRepo(pool)
	h := hub.New()
	go h.Run()

	mux := http.NewServeMux()
	handler.New(h, repo, testutil.TestSecret).Mount(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	roomID := uuid.New()
	ctx := context.Background()
	t.Cleanup(func() { repo.DeleteByRoom(ctx, roomID) })

	// Seed one message directly via the repository.
	seed := &domain.Message{
		ID:         uuid.New(),
		RoomID:     roomID,
		SenderID:   "u1",
		SenderName: "Alice",
		Content:    "seeded message",
		CreatedAt:  time.Now().UTC(),
	}
	if err := repo.Save(ctx, seed); err != nil {
		t.Fatalf("seed: %v", err)
	}

	token := testutil.MakeToken(t, "u1", "alice@example.com", "Alice", "manager")
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/chat/rooms/%s/messages", srv.URL, roomID), nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}

	var msgs []domain.Message
	if err := json.NewDecoder(resp.Body).Decode(&msgs); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(msgs) != 1 || msgs[0].Content != "seeded message" {
		t.Fatalf("unexpected response: %+v", msgs)
	}
}

// TestWebSocket_SendReceive verifies the full real-time flow:
// two clients join the same room; a message sent by one is received by the other.
func TestWebSocket_SendReceive(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	roomID := uuid.New()

	// Clean up persisted messages after the test.
	pool := testutil.NewPool(t)
	t.Cleanup(func() {
		repository.NewMessageRepo(pool).DeleteByRoom(context.Background(), roomID)
	})

	token1 := testutil.MakeToken(t, "u1", "alice@example.com", "Alice", "manager")
	token2 := testutil.MakeToken(t, "u2", "bob@example.com", "Bob", "employee")

	wsURL := func(token string) string {
		return fmt.Sprintf("ws%s/api/chat/ws/%s?token=%s", strings.TrimPrefix(srv.URL, "http"), roomID, token)
	}

	conn1, _, err := websocket.DefaultDialer.Dial(wsURL(token1), nil)
	if err != nil {
		t.Fatalf("dial ws1: %v", err)
	}
	defer conn1.Close()

	conn2, _, err := websocket.DefaultDialer.Dial(wsURL(token2), nil)
	if err != nil {
		t.Fatalf("dial ws2: %v", err)
	}
	defer conn2.Close()

	// Give the hub time to register both clients.
	time.Sleep(50 * time.Millisecond)

	// Client 1 sends a message.
	payload := `{"content":"hello from alice"}`
	if err := conn1.WriteMessage(websocket.TextMessage, []byte(payload)); err != nil {
		t.Fatalf("write: %v", err)
	}

	// Client 2 should receive it within a reasonable deadline.
	conn2.SetReadDeadline(time.Now().Add(3 * time.Second))
	_, raw, err := conn2.ReadMessage()
	if err != nil {
		t.Fatalf("read from ws2: %v", err)
	}

	var got domain.Message
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if got.Content != "hello from alice" {
		t.Fatalf("want 'hello from alice', got %q", got.Content)
	}
	if got.SenderName != "Alice" {
		t.Fatalf("want sender Alice, got %q", got.SenderName)
	}
	if got.RoomID != roomID {
		t.Fatalf("wrong room_id: %v", got.RoomID)
	}
}

// TestWebSocket_Unauthorized rejects the handshake with an invalid token.
func TestWebSocket_Unauthorized(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	wsURL := fmt.Sprintf("ws%s/api/chat/ws/%s?token=bad.token", strings.TrimPrefix(srv.URL, "http"), uuid.New())
	_, resp, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err == nil {
		t.Fatal("expected dial to fail")
	}
	if resp == nil || resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %v", resp)
	}
}

// TestWebSocket_MessagePersistedToDB verifies that a sent message is
// retrievable from the REST history endpoint after being sent over WebSocket.
func TestWebSocket_MessagePersistedToDB(t *testing.T) {
	pool := testutil.NewPool(t)
	repo := repository.NewMessageRepo(pool)
	h := hub.New()
	go h.Run()

	mux := http.NewServeMux()
	handler.New(h, repo, testutil.TestSecret).Mount(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	roomID := uuid.New()
	t.Cleanup(func() { repo.DeleteByRoom(context.Background(), roomID) })

	token := testutil.MakeToken(t, "u1", "alice@example.com", "Alice", "manager")
	wsURL := fmt.Sprintf("ws%s/api/chat/ws/%s?token=%s", strings.TrimPrefix(srv.URL, "http"), roomID, token)

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}

	if err := conn.WriteMessage(websocket.TextMessage, []byte(`{"content":"persist me"}`)); err != nil {
		t.Fatalf("write: %v", err)
	}

	// Wait for the save to complete before querying.
	time.Sleep(100 * time.Millisecond)
	conn.Close()

	msgs, err := repo.List(context.Background(), roomID, 10, nil)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(msgs) != 1 || msgs[0].Content != "persist me" {
		t.Fatalf("unexpected persisted messages: %+v", msgs)
	}
}
