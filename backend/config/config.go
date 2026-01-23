package config

import (
	"github.com/joho/godotenv"
	"os"
)

type Config struct {
	Host string
	Port string
}

func Load() Config {

	// Try loading .env from common working directories:
	// - repo root: "./.env"
	// - backend folder: "../.env"

	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	host := os.Getenv("GO_SERVICE_HOST")
	if host == "" {
		host = "0.0.0.0"
	}

	port := os.Getenv("GO_SERVICE_PORT")
	if port == "" {
		port = "8080"
	}

	return Config{Host: host, Port: port}
}
