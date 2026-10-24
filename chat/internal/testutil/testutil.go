package testutil

import (
	"context"
	"os"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"chat/internal/repository"
)

// TestSecret is the JWT secret used across all tests.
const TestSecret = "test-jwt-secret"

// NewPool connects to the test database defined by CHAT_TEST_DSN.
// Skips the test if the variable is unset (integration tests are opt-in).
// Runs schema migrations and registers pool.Close for cleanup.
func NewPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("CHAT_TEST_DSN")
	if dsn == "" {
		t.Skip("CHAT_TEST_DSN not set — skipping integration test")
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		t.Fatalf("connect to test DB: %v", err)
	}

	if _, err := pool.Exec(context.Background(), repository.Schema); err != nil {
		t.Fatalf("create schema: %v", err)
	}

	t.Cleanup(pool.Close)
	return pool
}

// MakeToken signs a JWT with TestSecret using the same payload shape
// as the Python backend (id, email, name, role).
func MakeToken(t *testing.T, userID, email, name, role string) string {
	t.Helper()
	claims := jwt.MapClaims{
		"id":    userID,
		"email": email,
		"name":  name,
		"role": map[string]any{
			"id":   "role-uuid",
			"name": role,
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(TestSecret))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return token
}
