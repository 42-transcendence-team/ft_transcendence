package repository

import (
	"backend/internal/models"
	"testing"
	"time"
)

func TestChatRepositoryUpdateLastTimeOpenChat(t *testing.T) {
	db := newTestDB(t)
	chatRepo := NewChatRepository(db)
	wsRepo := NewWebsocketRepository(db)

	user := seedUser(t, db, "user")
	room := &models.ChatRoom{Name: "chat", Private: false}
	_ = wsRepo.CreateRoom(room)
	_ = db.Model(room).Association("Members").Append(&user)

	if err := chatRepo.UpdateLastTimeOpenChat(user.ID, room.ID); err != nil {
		t.Fatalf("UpdateLastTimeOpenChat: %v", err)
	}
}

func TestChatRepositoryGetMessagesNoRead(t *testing.T) {
	db := newTestDB(t)
	chatRepo := NewChatRepository(db)
	wsRepo := NewWebsocketRepository(db)

	user := seedUser(t, db, "user")
	room := &models.ChatRoom{Name: "chat", Private: false}
	_ = wsRepo.CreateRoom(room)
	_ = db.Model(room).Association("Members").Append(&user)

	// Message created after the room_user row is considered unread.
	now := time.Now()
	_ = wsRepo.CreateChatMessage(&models.ChatMessage{
		RoomID:    room.ID,
		UserID:    user.ID,
		Username:  "user",
		Content:   "hi",
		Timestamp: &now,
	})

	count := chatRepo.GetMessagesNoRead(room.ID, user.ID)
	if count != 1 {
		t.Fatalf("expected 1 unread message, got %d", count)
	}
}
