package config

import (
	"strings"
	"testing"
)

func TestLoadRejectsInvalidEnv(t *testing.T) {
	t.Setenv("ENV", "staging")
	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid ENV")
	}
	if !strings.Contains(err.Error(), "ENV must be") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestLoadRequiresEnvSet(t *testing.T) {
	t.Setenv("ENV", "")
	_, err := Load()
	if err == nil {
		t.Fatal("expected error when ENV is empty")
	}
}

func TestValidateAcceptsValidLocalConfig(t *testing.T) {
	c := validLocalConfig()
	if err := c.Validate(); err != nil {
		t.Fatalf("expected valid config, got %v", err)
	}
}

func TestValidateRequiresDBHost(t *testing.T) {
	c := validLocalConfig()
	c.DBHost = ""
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for missing DB_HOST")
	}
}

func TestValidateRejectsInvalidSSLMode(t *testing.T) {
	c := validLocalConfig()
	c.DBSSLMode = "bogus"
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for invalid DB_SSLMODE")
	}
}

func TestValidateRejectsZeroJWTExpiration(t *testing.T) {
	c := validLocalConfig()
	c.JwtExpirationTime = 0
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for JWT_EXPIRATION <= 0")
	}
}

func TestValidateProdRejectsInsecureSSL(t *testing.T) {
	c := validLocalConfig()
	c.Env = "prod"
	c.DBSSLMode = "disable"
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for prod with sslmode disable")
	}
}

func TestValidateProdRequiresJWTSecret(t *testing.T) {
	c := validLocalConfig()
	c.Env = "prod"
	c.JwtSecret = ""
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for missing JWT_SECRET in prod")
	}
}

func TestValidateRejectsBadPool(t *testing.T) {
	c := validLocalConfig()
	c.DBMaxOpenConns = 0
	if err := c.Validate(); err == nil {
		t.Fatal("expected error for DB_MAX_OPEN_CONNS < 1")
	}

	c2 := validLocalConfig()
	c2.DBMaxIdleConns = 10
	c2.DBMaxOpenConns = 5
	if err := c2.Validate(); err == nil {
		t.Fatal("expected error for DB_MAX_IDLE_CONNS > DB_MAX_OPEN_CONNS")
	}
}

func TestParseAndValidateURLs(t *testing.T) {
	urls, err := parseAndValidateURLs("https://localhost:6969,http://localhost:3000")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(urls) != 2 {
		t.Fatalf("expected 2 urls, got %d", len(urls))
	}
}

func TestParseAndValidateURLsRejectsBadScheme(t *testing.T) {
	if _, err := parseAndValidateURLs("ftp://localhost"); err == nil {
		t.Fatal("expected error for non-http scheme")
	}
}

func TestParseAndValidateURLsRejectsMissingHost(t *testing.T) {
	if _, err := parseAndValidateURLs("https://"); err == nil {
		t.Fatal("expected error for missing host")
	}
}

func validLocalConfig() *Config {
	return &Config{
		Env:                  "local",
		GoServiceHost:        "0.0.0.0",
		GoServicePort:        8080,
		DBHost:               "postgres",
		DBPort:               5432,
		DBName:               "transcendence",
		DBUser:               "postgres",
		DBPassword:           "postgrespass",
		DBSSLMode:            "disable",
		DBTimeZone:           "Europe/Madrid",
		DBMaxOpenConns:       25,
		DBMaxIdleConns:       25,
		DBConnMaxLifetimeMin: 5,
		JwtSecret:            "secret",
		JwtExpirationTime:    3600,
		GoAllowedURLs:        []string{"http://localhost:3000"},
		Issuer2FA:            "test",
		Expiration2FA:        300,
		Url:                  "https://localhost:6969",
	}
}
