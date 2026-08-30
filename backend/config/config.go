package config

import (
	"fmt"
	"net/url"
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

	GoAllowedURLs []string
	Issuer2FA     string
	Expiration2FA int

	RedisHost     string
	RedisPort     string
	RedisPassword string

	OAuth42ClientID     string
	OAuth42ClientSecret string
	OAuth42RedirectURI  string

	Url string
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

	urls, err := parseAndValidateURLs(os.Getenv("GO_ALLOWED_URLS"))
	if err != nil {
		return nil, fmt.Errorf("invalid GO_ALLOWED_URLS: %w", err)
	}
	c.GoAllowedURLs = urls

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

	// 2FA
	c.Issuer2FA = strings.TrimSpace(os.Getenv("ISSUER_2FA"))
	exp2FA, err := strconv.Atoi(strings.TrimSpace(os.Getenv("EXPIRATION_2FA")))
	if err != nil {
		return nil, fmt.Errorf("EXPIRATION_2FA must be a number")
	}
	c.Expiration2FA = exp2FA

	//Redis
	c.RedisHost = strings.TrimSpace(os.Getenv("REDIS_HOST"))
	c.RedisPort = strings.TrimSpace(os.Getenv("REDIS_PORT"))
	c.RedisPassword = strings.TrimSpace(os.Getenv("REDIS_PASSWORD"))

	// OAuth 42
	c.OAuth42ClientID = strings.TrimSpace(os.Getenv("OAUTH42_CLIENT_ID"))
	c.OAuth42ClientSecret = strings.TrimSpace(os.Getenv("OAUTH42_CLIENT_SECRET"))
	c.OAuth42RedirectURI = strings.TrimSpace(os.Getenv("OAUTH42_REDIRECT_URI"))

	// Pool (si no existen, luego tunePool mete defaults también)
	c.DBMaxOpenConns = envIntOrDefault("DB_MAX_OPEN_CONNS", 25)
	c.DBMaxIdleConns = envIntOrDefault("DB_MAX_IDLE_CONNS", 25)
	c.DBConnMaxLifetimeMin = envIntOrDefault("DB_CONN_MAX_LIFETIME_MIN", 5)

	// url app
	c.Url = strings.TrimSpace(os.Getenv("URL"))

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

func parseAndValidateURLs(s string) ([]string, error) {
	if s == "" {
		return []string{}, nil
	}
	parts := strings.Split(s, ",")
	var urls []string
	for _, p := range parts {
		t := strings.TrimSpace(p)
		t = strings.Trim(t, "\"")
		if t == "" {
			continue
		}

		u, err := url.Parse(t)
		if err != nil {
			return nil, fmt.Errorf("invalid URL '%s': %w", t, err)
		}
		if u.Scheme != "http" && u.Scheme != "https" {
			return nil, fmt.Errorf("invalid scheme in URL '%s' (only http/https allowed)", t)
		}

		if u.Host == "" {
			return nil, fmt.Errorf("invalid URL '%s': missing host", t)
		}

		urls = append(urls, t)
	}
	if len(urls) == 0 {
		return nil, fmt.Errorf("URL list cannot be empty")
	}
	return urls, nil
}
