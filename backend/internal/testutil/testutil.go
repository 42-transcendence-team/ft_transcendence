// Package testutil reúne helpers para tests del backend.
// Todos los helpers crean dependencias aisladas (SQLite in-memory/temp-file,
// miniredis) para que los tests no necesiten Postgres ni Redis reales.
package testutil

import (
	"path/filepath"
	"testing"

	"backend/config"
	"backend/internal/db"

	"github.com/alicebob/miniredis/v2"
	"github.com/glebarez/sqlite"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewTestDB abre una base de datos SQLite aislada por test (archivo temporal
// en t.TempDir, una sola conexión) y ejecuta el mismo Migrate que usa la app.
func NewTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := filepath.Join(t.TempDir(), "test.db")

	gdb, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		TranslateError: true,
		Logger:         logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("testutil: open sqlite: %v", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		t.Fatalf("testutil: get sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(1)

	if err := db.Migrate(gdb); err != nil {
		t.Fatalf("testutil: migrate: %v", err)
	}

	return gdb
}

// NewTestRedis arranca un servidor Redis simulado (miniredis) y devuelve un
// cliente go-redis conectado. Se cierra automáticamente al terminar el test.
func NewTestRedis(t *testing.T) *redis.Client {
	t.Helper()

	mini := miniredis.RunT(t)

	rdb := redis.NewClient(&redis.Options{
		Addr: mini.Addr(),
	})

	t.Cleanup(func() {
		_ = rdb.Close()
	})

	return rdb
}

// NewTestConfig devuelve una configuración mínima y válida para tests.
func NewTestConfig() *config.Config {
	return &config.Config{
		Env:               "local",
		GoServiceHost:     "127.0.0.1",
		GoServicePort:     8080,
		GoAllowedURLs:     []string{"http://localhost:3000"},
		JwtSecret:         "test-jwt-secret",
		JwtExpirationTime: 3600,
		Expiration2FA:     300,
		Issuer2FA:         "ft_transcendence_test",
	}
}
