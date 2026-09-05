package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestPostNotificationForFriend(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)
	u2, c2 := registerUser(t, engine)

	// u1 -> u2 friend request and accept
	rec := c1.req(http.MethodPost, "/api/v1/friends/requests", map[string]interface{}{
		"receiver_id": u2,
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on request, got %d (%s)", rec.Code, rec.Body.String())
	}
	var reqBody struct {
		Data struct {
			ID uint `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &reqBody)

	rec = c2.req(http.MethodPatch, fmt.Sprintf("/api/v1/friends/requests/%d/accept", reqBody.Data.ID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on accept, got %d (%s)", rec.Code, rec.Body.String())
	}

	// u1 creates a post -> u2 should get a POST notification
	rec = c1.req(http.MethodPost, "/api/v1/posts", map[string]interface{}{
		"content": "post for notification",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on post, got %d (%s)", rec.Code, rec.Body.String())
	}

	rec = c2.req(http.MethodGet, "/api/v1/notifications", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on notifications, got %d (%s)", rec.Code, rec.Body.String())
	}

	var feed []struct {
		ID   *uint  `json:"id"`
		Type string `json:"type"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &feed)

	var notifID uint
	for _, n := range feed {
		if n.Type == "POST" && n.ID != nil {
			notifID = *n.ID
			break
		}
	}
	if notifID == 0 {
		t.Fatalf("expected a POST notification, got %s", rec.Body.String())
	}

	// Mark as read
	rec = c2.req(http.MethodPut, fmt.Sprintf("/api/v1/notifications/%d/read", notifID), nil)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on mark read, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestNotificationFeedEmpty(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodGet, "/api/v1/notifications", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on notifications, got %d (%s)", rec.Code, rec.Body.String())
	}
}
