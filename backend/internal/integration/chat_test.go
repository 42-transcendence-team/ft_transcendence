package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
)

func TestCreateRoomAndListRooms(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)
	u2, c2 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/websocket/rooms", map[string]interface{}{
		"name":    "shared room",
		"private": false,
		"users":   []uint{u2},
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on create room, got %d (%s)", rec.Code, rec.Body.String())
	}

	var room struct {
		ID uint `json:"id"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &room)
	if room.ID == 0 {
		t.Fatalf("expected room id, got %s", rec.Body.String())
	}

	rec = c1.req(http.MethodGet, "/api/v1/websocket/rooms", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on list rooms (u1), got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "shared room") {
		t.Fatalf("expected room in u1 rooms, got %s", rec.Body.String())
	}

	rec = c2.req(http.MethodGet, "/api/v1/websocket/rooms", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on list rooms (u2), got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "shared room") {
		t.Fatalf("expected room in u2 rooms, got %s", rec.Body.String())
	}
}

func TestWebsocketGetMe(t *testing.T) {
	engine := newEngine(t)
	u1, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodGet, "/api/v1/websocket/me", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /websocket/me, got %d (%s)", rec.Code, rec.Body.String())
	}
	var me struct {
		ID    uint   `json:"id"`
		Login string `json:"login"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &me)
	if me.ID != u1 {
		t.Fatalf("expected user %d, got %s", u1, rec.Body.String())
	}
}

func TestCreateRoomRejectsEmptyUsers(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/websocket/rooms", map[string]interface{}{
		"name":    "empty",
		"private": false,
		"users":   []uint{},
	})
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on empty users, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestChatUnreadRoute(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)
	u2, _ := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/websocket/rooms", map[string]interface{}{
		"name":    "chat",
		"private": false,
		"users":   []uint{u2},
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on create room, got %d (%s)", rec.Code, rec.Body.String())
	}
	var room struct {
		ID uint `json:"id"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &room)

	// u1 opens the chat (marks last_read_at)
	rec = c1.req(http.MethodPut, "/api/v1/chat/enter", map[string]interface{}{
		"room_id": room.ID,
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on chat enter, got %d (%s)", rec.Code, rec.Body.String())
	}

	rec = c1.req(http.MethodGet, fmt.Sprintf("/api/v1/chat/unread/%d", room.ID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on chat unread, got %d (%s)", rec.Code, rec.Body.String())
	}
}
