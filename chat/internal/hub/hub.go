package hub

import (
	"encoding/json"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"chat/internal/domain"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = pongWait * 9 / 10
	maxMessageSize = 4096
)

// Client represents a single WebSocket connection in a room.
type Client struct {
	RoomID uuid.UUID
	User   domain.User
	hub    *Hub
	conn   *websocket.Conn
	Send   chan []byte
}

type envelope struct {
	roomID uuid.UUID
	data   []byte
}

// Hub maintains the set of active clients and routes broadcasts.
// All room map mutations happen inside the single Run() goroutine — no mutex needed.
type Hub struct {
	rooms     map[uuid.UUID]map[*Client]struct{}
	reg       chan *Client
	unreg     chan *Client
	broadcast chan *envelope
}

func New() *Hub {
	return &Hub{
		rooms:     make(map[uuid.UUID]map[*Client]struct{}),
		reg:       make(chan *Client, 256),
		unreg:     make(chan *Client, 256),
		broadcast: make(chan *envelope, 512),
	}
}

// Run must be called in its own goroutine. It is the sole owner of the rooms map.
func (h *Hub) Run() {
	for {
		select {
		case c := <-h.reg:
			if h.rooms[c.RoomID] == nil {
				h.rooms[c.RoomID] = make(map[*Client]struct{})
			}
			h.rooms[c.RoomID][c] = struct{}{}

		case c := <-h.unreg:
			if room, ok := h.rooms[c.RoomID]; ok {
				if _, ok := room[c]; ok {
					delete(room, c)
					close(c.Send)
					if len(room) == 0 {
						delete(h.rooms, c.RoomID)
					}
				}
			}

		case env := <-h.broadcast:
			for c := range h.rooms[env.roomID] {
				select {
				case c.Send <- env.data:
				default:
					// Slow client: drop it rather than blocking the hub.
					delete(h.rooms[env.roomID], c)
					close(c.Send)
				}
			}
		}
	}
}

func (h *Hub) Register(c *Client) {
	c.hub = h
	h.reg <- c
}

func (h *Hub) Unregister(c *Client) {
	h.unreg <- c
}

func (h *Hub) Broadcast(roomID uuid.UUID, msg *domain.Message) {
	data, _ := json.Marshal(msg)
	h.broadcast <- &envelope{roomID: roomID, data: data}
}

func NewClient(roomID uuid.UUID, user domain.User, conn *websocket.Conn) *Client {
	return &Client{
		RoomID: roomID,
		User:   user,
		conn:   conn,
		Send:   make(chan []byte, 256),
	}
}

// IncomingMessage is the JSON payload the client sends over WebSocket.
type IncomingMessage struct {
	Content  string  `json:"content"`
	FileURL  *string `json:"file_url,omitempty"`
	FileName *string `json:"file_name,omitempty"`
}

// WritePump pumps messages from the Send channel to the WebSocket connection.
// Run in its own goroutine.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.Send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ReadPump pumps messages from the WebSocket to onMessage.
// Unregisters the client on disconnect. Blocks until the connection is closed.
func (c *Client) ReadPump(onMessage func(in IncomingMessage)) {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				slog.Error("websocket read error", "err", err)
			}
			return
		}
		var in IncomingMessage
		if err := json.Unmarshal(raw, &in); err != nil {
			continue
		}
		// require at least text content or a file attachment
		if in.Content == "" && in.FileURL == nil {
			continue
		}
		onMessage(in)
	}
}
