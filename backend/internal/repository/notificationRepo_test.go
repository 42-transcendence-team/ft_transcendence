package repository

import (
	"backend/internal/models"
	"errors"
	"testing"

	"gorm.io/gorm"
)

func TestNotificationRepositoryCreateAndListUnread(t *testing.T) {
	db := newTestDB(t)
	repo := NewNotificationRepository(db)

	user := seedUser(t, db, "author")

	_ = repo.Create(&models.Notification{UserID: user.ID, Type: "FRIEND_REQUEST", Payload: "{}"})
	_ = repo.Create(&models.Notification{UserID: user.ID, Type: "POST", Payload: "{}"})

	unread, err := repo.ListUnreadByUserID(user.ID)
	if err != nil {
		t.Fatalf("ListUnreadByUserID: %v", err)
	}
	if len(unread) != 2 {
		t.Fatalf("expected 2 unread, got %d", len(unread))
	}
}

func TestNotificationRepositoryMarkAsRead(t *testing.T) {
	db := newTestDB(t)
	repo := NewNotificationRepository(db)

	user := seedUser(t, db, "author")
	_ = repo.Create(&models.Notification{UserID: user.ID, Type: "POST", Payload: "{}"})

	unread, _ := repo.ListUnreadByUserID(user.ID)
	if len(unread) != 1 {
		t.Fatalf("expected 1 unread, got %d", len(unread))
	}

	if err := repo.MarkAsRead(unread[0].ID, user.ID); err != nil {
		t.Fatalf("MarkAsRead: %v", err)
	}

	unread, _ = repo.ListUnreadByUserID(user.ID)
	if len(unread) != 0 {
		t.Fatalf("expected 0 unread after mark, got %d", len(unread))
	}
}

func TestNotificationRepositoryMarkAsReadWrongUser(t *testing.T) {
	db := newTestDB(t)
	repo := NewNotificationRepository(db)

	owner := seedUser(t, db, "owner")
	other := seedUser(t, db, "other")
	_ = repo.Create(&models.Notification{UserID: owner.ID, Type: "POST", Payload: "{}"})

	unread, _ := repo.ListUnreadByUserID(owner.ID)
	if err := repo.MarkAsRead(unread[0].ID, other.ID); !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Fatalf("expected not found for wrong user, got %v", err)
	}
}

func TestNotificationRepositoryMarkAllAsRead(t *testing.T) {
	db := newTestDB(t)
	repo := NewNotificationRepository(db)

	user := seedUser(t, db, "author")
	_ = repo.Create(&models.Notification{UserID: user.ID, Type: "A", Payload: "{}"})
	_ = repo.Create(&models.Notification{UserID: user.ID, Type: "B", Payload: "{}"})

	if err := repo.MarkAllAsRead(user.ID); err != nil {
		t.Fatalf("MarkAllAsRead: %v", err)
	}

	unread, _ := repo.ListUnreadByUserID(user.ID)
	if len(unread) != 0 {
		t.Fatalf("expected 0 unread, got %d", len(unread))
	}
}
