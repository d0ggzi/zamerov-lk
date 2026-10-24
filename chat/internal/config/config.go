package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	PostgresHost     string
	PostgresPort     int
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string
	JWTSecret        string
	Port             string
}

func Load() (*Config, error) {
	port, err := strconv.Atoi(getEnv("CHAT_POSTGRES_PORT", "5432"))
	if err != nil {
		return nil, fmt.Errorf("invalid CHAT_POSTGRES_PORT: %w", err)
	}
	return &Config{
		PostgresHost:     getEnv("CHAT_POSTGRES_HOST", "localhost"),
		PostgresPort:     port,
		PostgresUser:     getEnv("CHAT_POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("CHAT_POSTGRES_PASSWORD", ""),
		PostgresDB:       getEnv("CHAT_POSTGRES_DB", "chat"),
		JWTSecret:        mustGetEnv("JWT_SECRET"),
		Port:             getEnv("CHAT_PORT", "8090"),
	}, nil
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		c.PostgresHost, c.PostgresPort, c.PostgresUser, c.PostgresPassword, c.PostgresDB,
	)
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok {
		panic(fmt.Sprintf("required env variable %q is not set", key))
	}
	return v
}
