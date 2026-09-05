package repository

import (
	"backend/internal/models"
	"testing"
	"time"
)

func TestWebsocketRepositoryCreateRoomAndGetByID(t *testing.T) {
	db := newTestDB(t)
	repo := NewWebsocketRepository(db)

	room := &models.ChatRoom{Name: "general", Private: false}
	if err := repo.CreateRoom(room); err != nil {
		t.Fatalf("create room: %v", err)
	}
	if room.ID == 0 {
		t.Fatal("room id must be assigned")
	}

	found, err := repo.GetRoomByID(room.ID)
	if err != nil {
		t.Fatalf("GetRoomByID: %v", err)
	}
	if found.Name != "general" {
		t.Fatalf("expected general, got %q", found.Name)
	}
}

func TestWebsocketRepositoryGetSharedRoom(t *testing.T) {
	db := newTestDB(t)
	wsRepo := NewWebsocketRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")
	seedUser(t, db, "c")

	room := &models.ChatRoom{Name: "shared", Private: true}
	if err := wsRepo.CreateRoom(room); err != nil {
		t.Fatalf("create room: %v", err)
	}

	if err := db.Model(room).Association("Members").Append(&a, &b); err != nil {
		t.Fatalf("append members: %v", err)
	}

	found, err := wsRepo.GetSharedRoom(a.ID, b.ID)
	if err != nil {
		t.Fatalf("GetSharedRoom: %v", err)
	}
	if found.ID != room.ID {
		t.Fatalf("expected room %d, got %d", room.ID, found.ID)
	}

	// A room shared with a user that is not a member must not be found.
	_, err = wsRepo.GetSharedRoom(a.ID, 99999)
	if err == nil {
		t.Fatal("expected error for non-shared room")
	}
}

func TestWebsocketRepositoryListRooms(t *testing.T) {
	db := newTestDB(t)
	wsRepo := NewWebsocketRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	room := &models.ChatRoom{Name: "members", Private: false}
	_ = wsRepo.CreateRoom(room)
	_ = db.Model(room).Association("Members").Append(&a, &b)

	rooms, err := wsRepo.ListRooms(a.ID)
	if err != nil {
		t.Fatalf("ListRooms: %v", err)
	}
	if len(rooms) != 1 {
		t.Fatalf("expected 1 room, got %d", len(rooms))
	}
	if len(rooms[0].Members) != 2 {
		t.Fatalf("expected 2 members preloaded, got %d", len(rooms[0].Members))
	}
}

func TestWebsocketRepositoryCreateAndGetMessages(t *testing.T) {
	db := newTestDB(t)
	wsRepo := NewWebsocketRepository(db)

	a := seedUser(t, db, "a")
	room := &models.ChatRoom{Name: "chat", Private: false}
	_ = wsRepo.CreateRoom(room)

	now := time.Now()
	msg := &models.ChatMessage{
		RoomID:    room.ID,
		UserID:    a.ID,
		Username:  "a",
		Content:   "hello",
		Timestamp: &now,
	}
	if err := wsRepo.CreateChatMessage(msg); err != nil {
		t.Fatalf("create message: %v", err)
	}

	messages, err := wsRepo.GetMessages(room.ID)
	if err != nil {
		t.Fatalf("GetMessages: %v", err)
	}
	if len(messages) != 1 || messages[0].Content != "hello" {
		t.Fatalf("expected hello, got %+v", messages)
	}
}
