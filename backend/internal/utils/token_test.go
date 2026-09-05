package utils

import (
	"backend/config"
	"backend/internal/models"
	"errors"
	"net/http"
	"testing"
	"time"

	appErr "backend/internal/errors"
)

func testUser(id uint) *models.User {
	u := &models.User{Login: "test_user"}
	u.ID = id
	return u
}

func TestCreateAndValidateToken(t *testing.T) {
	cfg := &config.Config{JwtSecret: "secret", JwtExpirationTime: 3600}

	token, exp, err := CreateJwtToken(testUser(42), cfg)
	if err != nil {
		t.Fatalf("create token: %v", err)
	}
	if token == "" {
		t.Fatal("token must not be empty")
	}
	if exp.Before(time.Now()) {
		t.Fatal("expiration must be in the future")
	}

	claims, err := ValidateToken(token, cfg)
	if err != nil {
		t.Fatalf("validate token: %v", err)
	}
	if claims.Id != 42 {
		t.Fatalf("expected id 42, got %d", claims.Id)
	}
	if claims.Login != "test_user" {
		t.Fatalf("expected login test_user, got %q", claims.Login)
	}
}

func TestValidateTokenWrongSecret(t *testing.T) {
	cfg := &config.Config{JwtSecret: "secret", JwtExpirationTime: 3600}
	wrongCfg := &config.Config{JwtSecret: "other-secret", JwtExpirationTime: 3600}

	token, _, err := CreateJwtToken(testUser(1), cfg)
	if err != nil {
		t.Fatalf("create token: %v", err)
	}

	_, err = ValidateToken(token, wrongCfg)
	if err == nil {
		t.Fatal("expected error for wrong secret")
	}
	var ae *appErr.AppError
	if !errors.As(err, &ae) || ae.HTTPStatus != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized error, got %v", err)
	}
}

func TestValidateTokenExpired(t *testing.T) {
	cfg := &config.Config{JwtSecret: "secret", JwtExpirationTime: -10}

	token, _, err := CreateJwtToken(testUser(1), cfg)
	if err != nil {
		t.Fatalf("create token: %v", err)
	}

	_, err = ValidateToken(token, cfg)
	if err == nil {
		t.Fatal("expected error for expired token")
	}
}

func TestValidateTokenInvalid(t *testing.T) {
	cfg := &config.Config{JwtSecret: "secret", JwtExpirationTime: 3600}

	_, err := ValidateToken("not-a-jwt", cfg)
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestCreateTempJwtToken(t *testing.T) {
	token, err := CreateTempJwtToken()
	if err != nil {
		t.Fatalf("create temp token: %v", err)
	}
	if len(token) != 64 {
		t.Fatalf("expected 64 hex chars, got %d", len(token))
	}
}
