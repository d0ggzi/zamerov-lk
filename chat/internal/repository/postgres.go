package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"chat/internal/domain"
)

const Schema = `
CREATE TABLE IF NOT EXISTS messages (
    id          UUID        PRIMARY KEY,
    room_id     UUID        NOT NULL,
    sender_id   TEXT        NOT NULL,
    sender_name TEXT        NOT NULL,
    content     TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL,
    file_url    TEXT,
    file_name   TEXT
);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT;
CREATE INDEX IF NOT EXISTS idx_messages_room_created
    ON messages (room_id, created_at DESC);
`

type MessageRepo struct {
	pool *pgxpool.Pool
}

func NewMessageRepo(pool *pgxpool.Pool) *MessageRepo {
	return &MessageRepo{pool: pool}
}

func (r *MessageRepo) Save(ctx context.Context, msg *domain.Message) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO messages (id, room_id, sender_id, sender_name, content, created_at, file_url, file_name)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, msg.ID, msg.RoomID, msg.SenderID, msg.SenderName, msg.Content, msg.CreatedAt, msg.FileURL, msg.FileName)
	if err != nil {
		return fmt.Errorf("save message: %w", err)
	}
	return nil
}

// List returns up to limit messages in ascending (chronological) order.
// If before is non-nil, only messages older than that timestamp are returned
// (used for cursor-based pagination: pass the created_at of the oldest visible message).
func (r *MessageRepo) List(ctx context.Context, roomID uuid.UUID, limit int, before *time.Time) ([]domain.Message, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	query := `
		SELECT id, room_id, sender_id, sender_name, content, created_at, file_url, file_name
		FROM messages
		WHERE room_id = $1`
	args := []any{roomID}

	if before != nil {
		args = append(args, *before)
		query += fmt.Sprintf(" AND created_at < $%d", len(args))
	}

	args = append(args, limit)
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", len(args))

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query messages: %w", err)
	}
	defer rows.Close()

	msgs := make([]domain.Message, 0, limit)
	for rows.Next() {
		var m domain.Message
		if err := rows.Scan(&m.ID, &m.RoomID, &m.SenderID, &m.SenderName, &m.Content, &m.CreatedAt, &m.FileURL, &m.FileName); err != nil {
			return nil, fmt.Errorf("scan message: %w", err)
		}
		msgs = append(msgs, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// DB returns DESC (newest first for efficient keyset pagination);
	// reverse to chronological (oldest first) for the client.
	for i, j := 0, len(msgs)-1; i < j; i, j = i+1, j-1 {
		msgs[i], msgs[j] = msgs[j], msgs[i]
	}
	return msgs, nil
}

func (r *MessageRepo) DeleteByRoom(ctx context.Context, roomID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM messages WHERE room_id = $1`, roomID)
	return err
}
