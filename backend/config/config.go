package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Env string

	BackendPort int

	GoServiceHost string
	GoServicePort int

	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	DBTimeZone string

	DBMaxOpenConns       int
	DBMaxIdleConns       int
	DBConnMaxLifetimeMin int

	JwtSecret         string
	JwtExpirationTime int
}

func Load() (*Config, error) {

	env := strings.TrimSpace(os.Getenv("ENV"))

	if env != "local" && env != "prod" {
		return nil, fmt.Errorf("ENV must be 'local' or 'prod' (got %q)", env)
	}

	// Cargar .env SOLO si local (para "go run" fuera de docker)
	if env == "local" {
		_ = godotenv.Load(".env")
		_ = godotenv.Load("../.env")
	}

	c := &Config{}
	// Solo se colocan defaults a variables no criticas
	c.Env = env

	c.GoServiceHost = strings.TrimSpace(os.Getenv("GO_SERVICE_HOST"))
	c.GoServicePort = envIntOrDefault("GO_SERVICE_PORT", 8080)

	c.DBHost = strings.TrimSpace(os.Getenv("DB_HOST"))
	c.DBPort = envIntOrDefault("DB_PORT", 5432)
	c.DBName = strings.TrimSpace(os.Getenv("DB_NAME"))
	c.DBUser = strings.TrimSpace(os.Getenv("DB_USER"))
	c.DBPassword = strings.TrimSpace(os.Getenv("DB_PASSWORD"))
	c.DBSSLMode = strings.TrimSpace(os.Getenv("DB_SSLMODE"))
	c.DBTimeZone = strings.TrimSpace(os.Getenv("DB_TIMEZONE"))

	//Jwt
	exp, err := strconv.Atoi(strings.TrimSpace(os.Getenv("JWT_EXPIRATION")))
	if err != nil {
		return nil, fmt.Errorf("JWT_EXPIRATION must be a number")
	}
	c.JwtExpirationTime = exp
	c.JwtSecret = strings.TrimSpace(os.Getenv("JWT_SECRET"))

	// Pool (si no existen, luego tunePool mete defaults también)
	c.DBMaxOpenConns = envIntOrDefault("DB_MAX_OPEN_CONNS", 25)
	c.DBMaxIdleConns = envIntOrDefault("DB_MAX_IDLE_CONNS", 25)
	c.DBConnMaxLifetimeMin = envIntOrDefault("DB_CONN_MAX_LIFETIME_MIN", 5)

	// Validar que la configuracion sea valida
	if err := c.Validate(); err != nil {
		return nil, err
	}

	return c, nil
}

func envIntOrDefault(key string, def int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
