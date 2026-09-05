package repository

import (
	"testing"
	"time"

	"backend/internal/models"
	"backend/internal/testutil"

	"gorm.io/gorm"
)

func newTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	return testutil.NewTestDB(t)
}

func seedUser(t *testing.T, db *gorm.DB, login string) models.User {
	t.Helper()

	email := login + "@test.com"
	user := models.User{
		Login:    login,
		Email:    &email,
		Password: "hashedpass",
		Name:     "Name",
		Surname:  "Surname",
		Birthday: time.Date(1998, 6, 12, 0, 0, 0, 0, time.UTC),
		Role:     "normie",
		State:    "",
		Status:   0,
	}

	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("seed user %s: %v", login, err)
	}

	return user
}

func strPtr(s string) *string { return &s }
