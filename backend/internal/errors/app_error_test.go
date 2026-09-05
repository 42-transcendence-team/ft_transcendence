package errors

import (
	"errors"
	"testing"
)

func TestErrorHelpersSetStatusAndCode(t *testing.T) {
	cases := []struct {
		name     string
		err      error
		status   int
		code     string
		expected string
	}{
		{"bad request", NewBadRequest("bad"), 400, CodeBadRequest, "BAD_REQUEST: bad"},
		{"unauthorized", NewUnauthorized("auth"), 401, CodeUnauthorized, "UNAUTHORIZED: auth"},
		{"forbidden", NewForbidden("forbidden"), 403, CodeForbidden, "FORBIDDEN: forbidden"},
		{"not found", NewNotFound("missing"), 404, CodeNotFound, "NOT_FOUND: missing"},
		{"conflict", NewConflict("conflict"), 409, CodeConflict, "CONFLICT: conflict"},
		{"validation", NewValidation(map[string]string{"x": "y"}), 422, CodeValidation, "VALIDATION_ERROR: Some fields are invalid"},
		{"internal", NewInternal(errors.New("boom")), 500, CodeInternal, "INTERNAL_ERROR: boom"},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			ae, ok := c.err.(*AppError)
			if !ok {
				t.Fatalf("expected *AppError, got %T", c.err)
			}
			if ae.HTTPStatus != c.status {
				t.Errorf("status = %d, want %d", ae.HTTPStatus, c.status)
			}
			if ae.Code != c.code {
				t.Errorf("code = %q, want %q", ae.Code, c.code)
			}
			if got := ae.Error(); got != c.expected {
				t.Errorf("Error() = %q, want %q", got, c.expected)
			}
		})
	}
}

func TestNewInternalDoesNotExposeErrToClient(t *testing.T) {
	ae := NewInternal(errors.New("secret detail"))
	if ae.Message != "An unexpected error has occurred" {
		t.Fatalf("unexpected public message: %q", ae.Message)
	}
	if ae.Err == nil {
		t.Fatal("internal Err must be kept for logging")
	}
}

func TestAppErrorIsComparableViaErrorsAs(t *testing.T) {
	err := NewNotFound("x")
	var ae *AppError
	if !errors.As(err, &ae) {
		t.Fatal("expected errors.As to match *AppError")
	}
}
