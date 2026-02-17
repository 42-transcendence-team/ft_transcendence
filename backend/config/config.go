package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Host string
	Port string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	DBTimeZone string

	DBMaxOpenConns       int
	DBMaxIdleConns       int
	DBConnMaxLifetimeMin int
}

func Load() Config {
	// Try loading .env from common working directories:
	// - repo root: "./.env"
	// - backend folder: "../.env"
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	host := envOrDefault("GO_SERVICE_HOST", "0.0.0.0")
	port := envOrDefault("GO_SERVICE_PORT", "8080")

	// DB defaults (Docker-friendly)
	dbHost := envOrDefault("DB_HOST", "postgres")
	dbPort := envOrDefault("DB_PORT", "5432")
	dbUser := envOrDefault("DB_USER", "postgres")
	dbPassword := envOrDefault("DB_PASSWORD", "postgres")
	dbName := envOrDefault("DB_NAME", "postgres")
	dbSSLMode := envOrDefault("DB_SSLMODE", "disable")
	dbTimeZone := envOrDefault("DB_TIMEZONE", "Europe/Madrid")

	// Pool tuning (opcionales)
	dbMaxOpen := envIntOrDefault("DB_MAX_OPEN_CONNS", 25)
	dbMaxIdle := envIntOrDefault("DB_MAX_IDLE_CONNS", 25)
	dbMaxLife := envIntOrDefault("DB_CONN_MAX_LIFETIME_MIN", 5)

	return Config{
		Host: host,
		Port: port,

		DBHost:     dbHost,
		DBPort:     dbPort,
		DBUser:     dbUser,
		DBPassword: dbPassword,
		DBName:     dbName,
		DBSSLMode:  dbSSLMode,
		DBTimeZone: dbTimeZone,

		DBMaxOpenConns:       dbMaxOpen,
		DBMaxIdleConns:       dbMaxIdle,
		DBConnMaxLifetimeMin: dbMaxLife,
	}
}

func envOrDefault(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func envIntOrDefault(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
