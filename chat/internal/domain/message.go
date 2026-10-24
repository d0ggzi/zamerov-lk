package domain

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID         uuid.UUID `json:"id"`
	RoomID     uuid.UUID `json:"room_id"`
	SenderID   string    `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Content    string    `json:"content"`
	FileURL    *string   `json:"file_url,omitempty"`
	FileName   *string   `json:"file_name,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// User mirrors the JWT payload produced by the Python backend.
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"role"`
}
