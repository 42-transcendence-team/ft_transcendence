package config

import (
	"fmt"
)

// Validate garantiza que la configuración sea segura y coherente antes del arranque.
// Añadir validaciones aquí solo para:
// - Variables obligatorias (no pueden estar vacías)
// - Valores sensibles de seguridad (secrets, SSL, etc.)
// - Coherencia lógica (rangos, límites de puertos, consistencia del pool, etc.)
// NO añadir validaciones cosméticas o no críticas.
// El objetivo es evitar un arranque roto o inseguro, no imponer reglas arbitrarias.

func (c *Config) Validate() error {

	if err := validatePort("GO_SERVICE_PORT", c.GoServicePort); err != nil {
		return err
	}
	if c.GoServiceHost == "" {
		return fmt.Errorf("GO_SERVICE_HOST is required")
	}

	if c.DBHost == "" {
		return fmt.Errorf("DB_HOST is required")
	}
	if err := validatePort("DB_PORT", c.DBPort); err != nil {
		return err
	}
	if c.DBName == "" {
		return fmt.Errorf("DB_NAME is required")
	}
	if c.DBUser == "" {
		return fmt.Errorf("DB_USER is required")
	}
	if c.DBPassword == "" {
		return fmt.Errorf("DB_PASSWORD is required")
	}
	if c.DBPassword == "CHANGE_ME" {
		return fmt.Errorf("DB_PASSWORD cannot be 'CHANGE_ME'")
	}
	if c.JwtExpirationTime <= 0 {
		return fmt.Errorf("JWT_EXPIRATION must be > 0")
	}

	switch c.DBSSLMode {
	case "disable", "require", "verify-ca", "verify-full":
	default:
		return fmt.Errorf("DB_SSLMODE must be one of: disable|require|verify-ca|verify-full (got %q)", c.DBSSLMode)
	}

	if c.DBTimeZone == "" {
		return fmt.Errorf("DB_TIMEZONE is required")
	}

	// Reglas extra en prod
	if c.Env == "prod" {
		if c.DBSSLMode == "disable" {
			return fmt.Errorf("DB_SSLMODE cannot be 'disable' in prod")
		}
	}
	if len(c.GoAllowedURLs) == 0 {
		if c.Env == "prod" {
			return fmt.Errorf("GO_ALLOWED_URLS is required in production")
		}
		c.GoAllowedURLs = []string{"http://localhost:3000"} // Default si en .env esta vacia
	}

	// Pool:
	if c.DBMaxOpenConns < 1 {
		return fmt.Errorf("DB_MAX_OPEN_CONNS must be >= 1 (got %d)", c.DBMaxOpenConns)
	}
	if c.DBMaxIdleConns < 0 {
		return fmt.Errorf("DB_MAX_IDLE_CONNS must be >= 0 (got %d)", c.DBMaxIdleConns)
	}
	if c.DBMaxIdleConns > c.DBMaxOpenConns {
		return fmt.Errorf("DB_MAX_IDLE_CONNS cannot be > DB_MAX_OPEN_CONNS (%d > %d)", c.DBMaxIdleConns, c.DBMaxOpenConns)
	}
	if c.DBConnMaxLifetimeMin < 1 {
		return fmt.Errorf("DB_CONN_MAX_LIFETIME_MIN must be >= 1 (got %d)", c.DBConnMaxLifetimeMin)
	}

	return nil
}

func validatePort(name string, port int) error {
	if port < 1 || port > 65535 {
		return fmt.Errorf("%s must be between 1 and 65535 (got %d)", name, port)
	}
	return nil
}
