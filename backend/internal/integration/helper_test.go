package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"

	"backend/internal/server"
	"backend/internal/testutil"

	"github.com/gin-gonic/gin"
)

type apiClient struct {
	t      *testing.T
	engine *gin.Engine
	cookie string
}

func newClient(t *testing.T, engine *gin.Engine) *apiClient {
	return &apiClient{t: t, engine: engine}
}

func (c *apiClient) req(method, path string, body interface{}) *httptest.ResponseRecorder {
	c.t.Helper()

	var payload []byte
	if body != nil {
		payload, _ = json.Marshal(body)
	}

	cur := path
	for i := 0; i < 5; i++ {
		var reader io.Reader
		if payload != nil {
			reader = bytes.NewReader(payload)
		}

		req := httptest.NewRequest(method, cur, reader)
		if payload != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		if c.cookie != "" {
			req.Header.Set("Cookie", c.cookie)
		}

		rec := httptest.NewRecorder()
		c.engine.ServeHTTP(rec, req)
		c.captureCookie(rec)

		if isRedirect(rec.Code) {
			loc := rec.Header().Get("Location")
			if loc == "" {
				return rec
			}
			cur = loc
			continue
		}
		return rec
	}
	c.t.Fatalf("too many redirects for %s %s", method, path)
	return nil
}

func isRedirect(code int) bool {
	return code == http.StatusMovedPermanently ||
		code == http.StatusFound ||
		code == http.StatusSeeOther ||
		code == http.StatusTemporaryRedirect ||
		code == http.StatusPermanentRedirect
}

func (c *apiClient) captureCookie(rec *httptest.ResponseRecorder) {
	for _, setCookie := range rec.Header().Values("Set-Cookie") {
		if strings.Contains(setCookie, "jwt=") {
			c.cookie = strings.Split(setCookie, ";")[0] + ";"
		}
	}
}

func newEngine(t *testing.T) *gin.Engine {
	t.Helper()
	return newTestServer(t)
}

// newTestServer construye el servidor HTTP real (router completo) con una base
// de datos SQLite y un Redis simulado aislados por test.
func newTestServer(t *testing.T) *gin.Engine {
	t.Helper()

	t.Setenv("API_LOG_PATH", filepath.Join(t.TempDir(), "go-app.log"))

	srv := server.NewHTTPServer(
		testutil.NewTestConfig(),
		testutil.NewTestDB(t),
		testutil.NewTestRedis(t),
	)

	return srv.Engine
}

var regCounter int64

func registerWithLogin(t *testing.T, engine *gin.Engine, login, password string) *apiClient {
	t.Helper()

	client := newClient(t, engine)
	rec := client.req(http.MethodPost, "/api/v1/auth/register", map[string]interface{}{
		"login":              login,
		"email":              login + "@test.com",
		"password":           password,
		"confirmPassword":    password,
		"name":               "Name",
		"surname":            "Surname",
		"birthday":           "1998-06-12",
		"termsAndConditions": true,
		"privacyPolicy":      true,
	})

	if rec.Code != http.StatusCreated {
		t.Fatalf("register failed: status=%d body=%s", rec.Code, rec.Body.String())
	}
	return client
}

// registerUser crea un usuario único y devuelve su ID y un cliente autenticado.
func registerUser(t *testing.T, engine *gin.Engine) (uint, *apiClient) {
	t.Helper()

	n := atomic.AddInt64(&regCounter, 1)
	login := fmt.Sprintf("user_%d", n)
	password := "Easypass12345!"
	client := registerWithLogin(t, engine, login, password)

	rec := client.req(http.MethodGet, "/api/v1/auth/me", nil)
	var me struct {
		Authenticated bool `json:"authenticated"`
		User          struct {
			ID uint `json:"id"`
		} `json:"user"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &me); err != nil {
		t.Fatalf("cannot parse /auth/me: %v (%s)", err, rec.Body.String())
	}
	if !me.Authenticated || me.User.ID == 0 {
		t.Fatalf("expected authenticated user, got %s", rec.Body.String())
	}
	return me.User.ID, client
}

func loginClient(t *testing.T, engine *gin.Engine, login, password string) *apiClient {
	t.Helper()
	client := newClient(t, engine)
	rec := client.req(http.MethodPost, "/api/v1/auth/login", map[string]interface{}{
		"identifier": login,
		"password":   password,
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("login failed: status=%d body=%s", rec.Code, rec.Body.String())
	}
	return client
}

func loginClientNoAssert(t *testing.T, engine *gin.Engine, login, password string) *httptest.ResponseRecorder {
	t.Helper()
	client := newClient(t, engine)
	return client.req(http.MethodPost, "/api/v1/auth/login", map[string]interface{}{
		"identifier": login,
		"password":   password,
	})
}
