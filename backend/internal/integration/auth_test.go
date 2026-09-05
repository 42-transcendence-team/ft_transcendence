package integration

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestRegisterAndWhoami(t *testing.T) {
	engine := newEngine(t)

	id, client := registerUser(t, engine)
	if id == 0 {
		t.Fatal("expected a non-zero user id")
	}

	rec := client.req(http.MethodGet, "/api/v1/auth/me", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d (%s)", rec.Code, rec.Body.String())
	}

	var body struct {
		Authenticated bool `json:"authenticated"`
		User          struct {
			ID uint `json:"id"`
		} `json:"user"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &body)
	if !body.Authenticated || body.User.ID != id {
		t.Fatalf("expected authenticated user %d, got %s", id, rec.Body.String())
	}
}

func TestRegisterDuplicateConflict(t *testing.T) {
	engine := newEngine(t)
	registerWithLogin(t, engine, "dupe_user", "Easypass12345!")

	client := newClient(t, engine)
	rec := client.req(http.MethodPost, "/api/v1/auth/register", map[string]interface{}{
		"login":              "dupe_user",
		"email":              "dupe_user@test.com",
		"password":           "Easypass12345!",
		"confirmPassword":    "Easypass12345!",
		"name":               "Name",
		"surname":            "Surname",
		"birthday":           "1998-06-12",
		"termsAndConditions": true,
		"privacyPolicy":      true,
	})
	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 for duplicate register, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestLoginWrongPassword(t *testing.T) {
	engine := newEngine(t)
	registerWithLogin(t, engine, "login_user", "Easypass12345!")

	rec := loginClientNoAssert(t, engine, "login_user", "Wrongpass12345!")
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for wrong password, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestLoginUnknownUser(t *testing.T) {
	engine := newEngine(t)

	rec := loginClientNoAssert(t, engine, "ghost_user", "Easypass12345!")
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for unknown user, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestLoginAndProtectedRoute(t *testing.T) {
	engine := newEngine(t)
	registerWithLogin(t, engine, "protected_user", "Easypass12345!")

	client := loginClient(t, engine, "protected_user", "Easypass12345!")

	rec := client.req(http.MethodGet, "/api/v1/test", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /test with session, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestProtectedRouteWithoutSession(t *testing.T) {
	engine := newEngine(t)

	client := newClient(t, engine)
	rec := client.req(http.MethodGet, "/api/v1/test", nil)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without session, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestLogoutInvalidatesSession(t *testing.T) {
	engine := newEngine(t)
	registerWithLogin(t, engine, "logout_user", "Easypass12345!")
	client := loginClient(t, engine, "logout_user", "Easypass12345!")

	rec := client.req(http.MethodPost, "/api/v1/auth/logout", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on logout, got %d (%s)", rec.Code, rec.Body.String())
	}

	// The stored jwt cookie is still present but the Redis session was deleted.
	rec = client.req(http.MethodGet, "/api/v1/test", nil)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 after logout, got %d (%s)", rec.Code, rec.Body.String())
	}
}
