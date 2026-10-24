package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"chat/internal/domain"
	"chat/internal/hub"
	"chat/internal/repository"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Handler struct {
	hub    *hub.Hub
	repo   *repository.MessageRepo
	secret []byte
}

func New(h *hub.Hub, repo *repository.MessageRepo, secret string) *Handler {
	return &Handler{hub: h, repo: repo, secret: []byte(secret)}
}

func (h *Handler) Mount(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/chat/rooms/{room_id}/messages", h.listMessages)
	mux.HandleFunc("GET /api/chat/ws/{room_id}", h.serveWS)
}

// parseToken validates a JWT and returns the embedded user.
func (h *Handler) parseToken(tokenStr string) (*domain.User, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return h.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, jwt.ErrTokenInvalidClaims
	}

	user := &domain.User{
		ID:    claimStr(claims, "id"),
		Email: claimStr(claims, "email"),
		Name:  claimStr(claims, "name"),
	}
	if role, ok := claims["role"].(map[string]any); ok {
		user.Role.ID = claimStr(role, "id")
		user.Role.Name = claimStr(role, "name")
	}
	return user, nil
}

func claimStr(m map[string]any, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func bearerToken(r *http.Request) string {
	v := r.Header.Get("Authorization")
	if after, ok := strings.CutPrefix(v, "Bearer "); ok {
		return after
	}
	return ""
}

// listMessages returns paginated message history for a room.
// Query params: limit (int, default 50), before (RFC3339 timestamp for cursor pagination).
func (h *Handler) listMessages(w http.ResponseWriter, r *http.Request) {
	if _, err := h.parseToken(bearerToken(r)); err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	roomID, err := uuid.Parse(r.PathValue("room_id"))
	if err != nil {
		http.Error(w, "invalid room_id", http.StatusBadRequest)
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	var before *time.Time
	if b := r.URL.Query().Get("before"); b != "" {
		t, err := time.Parse(time.RFC3339Nano, b)
		if err == nil {
			before = &t
		}
	}

	msgs, err := h.repo.List(r.Context(), roomID, limit, before)
	if err != nil {
		slog.Error("list messages", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msgs)
}

// serveWS upgrades the connection to WebSocket, registers the client in the hub,
// persists incoming messages to the DB, and broadcasts them to the room.
// The JWT token is passed as the ?token= query parameter (browser WS API
// does not support custom headers during the handshake).
func (h *Handler) serveWS(w http.ResponseWriter, r *http.Request) {
	user, err := h.parseToken(r.URL.Query().Get("token"))
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	roomID, err := uuid.Parse(r.PathValue("room_id"))
	if err != nil {
		http.Error(w, "invalid room_id", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("ws upgrade", "err", err)
		return
	}

	client := hub.NewClient(roomID, *user, conn)
	h.hub.Register(client)

	go client.WritePump()

	// ReadPump blocks until the connection is closed.
	client.ReadPump(func(in hub.IncomingMessage) {
		msg := &domain.Message{
			ID:         uuid.New(),
			RoomID:     roomID,
			SenderID:   user.ID,
			SenderName: user.Name,
			Content:    in.Content,
			FileURL:    in.FileURL,
			FileName:   in.FileName,
			CreatedAt:  time.Now().UTC(),
		}
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := h.repo.Save(ctx, msg); err != nil {
			slog.Error("save message", "err", err)
			return
		}
		h.hub.Broadcast(roomID, msg)
	})
}
