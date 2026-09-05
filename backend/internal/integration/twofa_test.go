package integration

import (
	"net/http"
	"strings"
	"testing"
)

func Test2FAEnableVerifyAndDisableErrors(t *testing.T) {
	engine := newEngine(t)
	_, c1 := registerUser(t, engine)

	// Enable -> 200 with QR
	rec := c1.req(http.MethodPost, "/api/v1/2fa/enable", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on enable, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "QR") {
		t.Fatalf("expected QR in response, got %s", rec.Body.String())
	}

	// Enable again -> 200 (2FA only becomes active after verification, so the
	// "already enabled" guard is not triggered yet).
	rec = c1.req(http.MethodPost, "/api/v1/2fa/enable", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on second enable, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Verify with invalid code -> 401
	rec = c1.req(http.MethodPost, "/api/v1/2fa/verify", map[string]interface{}{
		"code": "000000",
	})
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 on invalid verify code, got %d (%s)", rec.Code, rec.Body.String())
	}

	// Disable with invalid code -> 401
	rec = c1.req(http.MethodPost, "/api/v1/2fa/disable", map[string]interface{}{
		"code": "000000",
	})
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 on invalid disable code, got %d (%s)", rec.Code, rec.Body.String())
	}
}
