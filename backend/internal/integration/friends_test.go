package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestFriendRequestAcceptAndDeleteFlow(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)
	u2, c2 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/friends/requests", map[string]interface{}{
		"receiver_id": u2,
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on send request, got %d (%s)", rec.Code, rec.Body.String())
	}

	var sendBody struct {
		Data struct {
			ID uint `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &sendBody)
	reqID := sendBody.Data.ID
	if reqID == 0 {
		t.Fatalf("expected request id, got %s", rec.Body.String())
	}

	// Duplicate request -> conflict
	rec = c1.req(http.MethodPost, "/api/v1/friends/requests", map[string]interface{}{
		"receiver_id": u2,
	})
	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 on duplicate request, got %d (%s)", rec.Code, rec.Body.String())
	}

	// u2 sees incoming request
	rec = c2.req(http.MethodGet, "/api/v1/friends/requests/incoming", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on incoming, got %d (%s)", rec.Code, rec.Body.String())
	}
	var incoming struct {
		Data []interface{} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &incoming)
	if len(incoming.Data) != 1 {
		t.Fatalf("expected 1 incoming request, got %d", len(incoming.Data))
	}

	// u2 accepts
	rec = c2.req(http.MethodPatch, fmt.Sprintf("/api/v1/friends/requests/%d/accept", reqID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on accept, got %d (%s)", rec.Code, rec.Body.String())
	}

	// u1 lists friends -> should have u2
	rec = c1.req(http.MethodGet, "/api/v1/friends/", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on list friends, got %d (%s)", rec.Code, rec.Body.String())
	}
	var friends struct {
		Data []struct {
			UserID uint `json:"user_id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &friends)
	if len(friends.Data) != 1 || friends.Data[0].UserID != u2 {
		t.Fatalf("expected friend u2, got %+v", friends.Data)
	}

	// u1 deletes friend
	rec = c1.req(http.MethodDelete, fmt.Sprintf("/api/v1/friends/%d", u2), nil)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on delete friend, got %d (%s)", rec.Code, rec.Body.String())
	}

	// friends list now empty
	rec = c1.req(http.MethodGet, "/api/v1/friends/", nil)
	_ = json.Unmarshal(rec.Body.Bytes(), &friends)
	if len(friends.Data) != 0 {
		t.Fatalf("expected no friends after delete, got %+v", friends.Data)
	}
}

func TestFriendRequestReject(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)
	u2, c2 := registerUser(t, engine)

	// u1 sends a request to u2
	rec := c1.req(http.MethodPost, "/api/v1/friends/requests", map[string]interface{}{
		"receiver_id": u2,
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on send request, got %d (%s)", rec.Code, rec.Body.String())
	}

	var sendBody struct {
		Data struct {
			ID uint `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &sendBody)
	reqID := sendBody.Data.ID

	// u2 rejects
	rec = c2.req(http.MethodPatch, fmt.Sprintf("/api/v1/friends/requests/%d/reject", reqID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on reject, got %d (%s)", rec.Code, rec.Body.String())
	}

	// u2 tries to accept the rejected request -> conflict
	rec = c2.req(http.MethodPatch, fmt.Sprintf("/api/v1/friends/requests/%d/accept", reqID), nil)
	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 on accepting a rejected request, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestBlockAndUnblockFlow(t *testing.T) {
	engine := newEngine(t)
	u1, c1 := registerUser(t, engine)
	u2, _ := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/friends/blocks", map[string]interface{}{
		"blocked_id": u2,
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on block, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Block again -> conflict
	rec = c1.req(http.MethodPost, "/api/v1/friends/blocks", map[string]interface{}{
		"blocked_id": u2,
	})
	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 on duplicate block, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Block self -> bad request
	rec = c1.req(http.MethodPost, "/api/v1/friends/blocks", map[string]interface{}{
		"blocked_id": u1,
	})
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on self block, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Block non-existent user -> not found
	rec = c1.req(http.MethodPost, "/api/v1/friends/blocks", map[string]interface{}{
		"blocked_id": 999999,
	})
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on block non-existent, got %d (%s)", rec.Code, rec.Body.String())
	}

	// List blocks contains u2
	rec = c1.req(http.MethodGet, "/api/v1/friends/blocks", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on list blocks, got %d (%s)", rec.Code, rec.Body.String())
	}
	var blocks struct {
		Data []struct {
			UserID uint `json:"user_id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &blocks)
	if len(blocks.Data) != 1 || blocks.Data[0].UserID != u2 {
		t.Fatalf("expected blocked u2, got %+v", blocks.Data)
	}

	// Unblock
	rec = c1.req(http.MethodDelete, fmt.Sprintf("/api/v1/friends/blocks/%d", u2), nil)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on unblock, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestSendFriendRequestToSelf(t *testing.T) {
	engine := newEngine(t)
	u1, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/friends/requests", map[string]interface{}{
		"receiver_id": u1,
	})
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on self request, got %d (%s)", rec.Code, rec.Body.String())
	}
}
