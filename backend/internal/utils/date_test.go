package utils

import (
	"testing"
	"time"
)

func TestCalculateAge(t *testing.T) {
	now := time.Now()

	cases := []struct {
		name     string
		birthday time.Time
		want     int
	}{
		{"birthday today", time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC), 0},
		{"exactly 18", now.AddDate(-18, 0, 0), 18},
		{"19 yesterday", now.AddDate(-18, 0, -1), 18},
		{"18 and 364 days", now.AddDate(-19, 0, 1), 18},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := CalculateAge(c.birthday); got != c.want {
				t.Errorf("CalculateAge(%v) = %d, want %d", c.birthday, got, c.want)
			}
		})
	}
}
