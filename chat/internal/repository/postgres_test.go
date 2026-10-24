package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"chat/internal/domain"
	"chat/internal/repository"
	"chat/internal/testutil"
)

func TestSave_andList(t *testing.T) {
	pool := testutil.NewPool(t)
	repo := repository.NewMessageRepo(pool)
	ctx := context.Background()

	roomID := uuid.New()
	t.Cleanup(func() { repo.DeleteByRoom(ctx, roomID) })

	msgs := []domain.Message{
		{ID: uuid.New(), RoomID: roomID, SenderID: "u1", SenderName: "Alice", Content: "hello", CreatedAt: time.Now().UTC().Add(-2 * time.Second)},
		{ID: uuid.New(), RoomID: roomID, SenderID: "u2", SenderName: "Bob", Content: "world", CreatedAt: time.Now().UTC().Add(-1 * time.Second)},
		{ID: uuid.New(), RoomID: roomID, SenderID: "u1", SenderName: "Alice", Content: "bye", CreatedAt: time.Now().UTC()},
	}

	for i := range msgs {
		if err := repo.Save(ctx, &msgs[i]); err != nil {
			t.Fatalf("Save[%d]: %v", i, err)
		}
	}

	t.Run("list all", func(t *testing.T) {
		got, err := repo.List(ctx, roomID, 50, nil)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(got) != 3 {
			t.Fatalf("want 3 messages, got %d", len(got))
		}
		// Must be in ascending (chronological) order.
		if got[0].Content != "hello" || got[1].Content != "world" || got[2].Content != "bye" {
			t.Fatalf("unexpected order: %v", contents(got))
		}
	})

	t.Run("list with limit", func(t *testing.T) {
		got, err := repo.List(ctx, roomID, 2, nil)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(got) != 2 {
			t.Fatalf("want 2 messages, got %d", len(got))
		}
		// With DESC + LIMIT 2, we get the 2 newest; after reversing: world, bye.
		if got[0].Content != "world" || got[1].Content != "bye" {
			t.Fatalf("unexpected messages: %v", contents(got))
		}
	})

	t.Run("cursor pagination", func(t *testing.T) {
		// Load the first page (newest 2).
		page1, err := repo.List(ctx, roomID, 2, nil)
		if err != nil {
			t.Fatalf("page1: %v", err)
		}
		// Cursor = created_at of the oldest message on page1 (index 0 after reversal).
		cursor := page1[0].CreatedAt
		page2, err := repo.List(ctx, roomID, 50, &cursor)
		if err != nil {
			t.Fatalf("page2: %v", err)
		}
		if len(page2) != 1 || page2[0].Content != "hello" {
			t.Fatalf("unexpected page2: %v", contents(page2))
		}
	})

	t.Run("empty room", func(t *testing.T) {
		got, err := repo.List(ctx, uuid.New(), 50, nil)
		if err != nil {
			t.Fatalf("List: %v", err)
		}
		if len(got) != 0 {
			t.Fatalf("want 0 messages, got %d", len(got))
		}
	})
}

func contents(msgs []domain.Message) []string {
	out := make([]string, len(msgs))
	for i, m := range msgs {
		out[i] = m.Content
	}
	return out
}
