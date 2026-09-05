package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
)

func TestCreatePostAndListFeed(t *testing.T) {
	engine := newEngine(t)
	u1, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/posts", map[string]interface{}{
		"content": "hola mundo",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create post, got %d (%s)", rec.Code, rec.Body.String())
	}

	rec = c1.req(http.MethodGet, "/api/v1/posts/feed", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on feed, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "hola mundo") {
		t.Fatalf("feed must contain the post, got %s", rec.Body.String())
	}

	rec = c1.req(http.MethodGet, fmt.Sprintf("/api/v1/posts/user/%d", u1), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on user posts, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "hola mundo") {
		t.Fatalf("user posts must contain the post, got %s", rec.Body.String())
	}
}

func TestCommentAndLikeFlow(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/posts", map[string]interface{}{
		"content": "post with comments",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create post, got %d (%s)", rec.Code, rec.Body.String())
	}

	var postBody struct {
		Data struct {
			ID uint `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &postBody)
	postID := postBody.Data.ID
	if postID == 0 {
		t.Fatalf("expected post id, got %s", rec.Body.String())
	}

	// Create comment
	rec = c1.req(http.MethodPost, fmt.Sprintf("/api/v1/posts/%d/comments", postID), map[string]interface{}{
		"content": "nice post",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on comment, got %d (%s)", rec.Code, rec.Body.String())
	}

	// List comments
	rec = c1.req(http.MethodGet, fmt.Sprintf("/api/v1/posts/%d/comments", postID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on list comments, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "nice post") {
		t.Fatalf("comments must contain the comment, got %s", rec.Body.String())
	}

	// Like
	rec = c1.req(http.MethodPost, fmt.Sprintf("/api/v1/posts/%d/likes", postID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on like, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Unlike
	rec = c1.req(http.MethodDelete, fmt.Sprintf("/api/v1/posts/%d/likes", postID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on unlike, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestGetPostByID(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)

	rec := c1.req(http.MethodPost, "/api/v1/posts", map[string]interface{}{
		"content": "single post",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create post, got %d (%s)", rec.Code, rec.Body.String())
	}

	var postBody struct {
		Data struct {
			ID uint `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &postBody)

	rec = c1.req(http.MethodGet, fmt.Sprintf("/api/v1/posts/%d", postBody.Data.ID), nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on get post, got %d (%s)", rec.Code, rec.Body.String())
	}
}
