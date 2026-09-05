package games

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestGameConnectPlayerLocalRejectsSecond(t *testing.T) {
	c := newConnectFour(2, "local")
	if err := c.ConnectPlayer(1, "user1"); err != nil {
		t.Fatalf("connect first: %v", err)
	}
	wantAppError(t, c.ConnectPlayer(2, "user2"), http.StatusConflict)
}

func TestGameConnectPlayerOnlineAssignsTokensAndViewer(t *testing.T) {
	c := newConnectFour(2, "online")

	if err := c.ConnectPlayer(1, "user1"); err != nil {
		t.Fatalf("connect p1: %v", err)
	}
	if err := c.ConnectPlayer(2, "user2"); err != nil {
		t.Fatalf("connect p2: %v", err)
	}

	if len(c.Players) != 2 {
		t.Fatalf("expected 2 players, got %d", len(c.Players))
	}
	if c.Players[0].Token != 1 || c.Players[1].Token != 2 {
		t.Fatalf("expected tokens 1 and 2, got %d and %d", c.Players[0].Token, c.Players[1].Token)
	}

	// A third user joins as viewer
	if err := c.ConnectPlayer(3, "user3"); err != nil {
		t.Fatalf("connect viewer: %v", err)
	}
	if len(c.Players) != 3 {
		t.Fatalf("expected 3 players (incl. viewer), got %d", len(c.Players))
	}
	if c.Players[2].Type != "viewer" {
		t.Fatalf("expected third player to be viewer, got %q", c.Players[2].Type)
	}
}

func TestGameConnectPlayerOnlineReconnect(t *testing.T) {
	c := newConnectFour(2, "online")
	_ = c.ConnectPlayer(1, "user1")
	_ = c.ConnectPlayer(2, "user2")

	_ = c.DisconnectPlayer(1)
	if c.Players[0].Connected {
		t.Fatal("player 1 must be disconnected")
	}

	if err := c.ConnectPlayer(1, "user1"); err != nil {
		t.Fatalf("reconnect: %v", err)
	}
	if !c.Players[0].Connected {
		t.Fatal("player 1 must be reconnected")
	}
}

func TestGameDisconnectPlayerMarksLeftAt(t *testing.T) {
	c := newConnectFour(2, "online")
	_ = c.ConnectPlayer(1, "user1")
	_ = c.ConnectPlayer(2, "user2")

	if err := c.DisconnectPlayer(1); err != nil {
		t.Fatalf("disconnect: %v", err)
	}
	if c.Players[0].Connected {
		t.Fatal("player must be disconnected")
	}
	if c.Players[0].LeftAt.IsZero() {
		t.Fatal("left_at must be set")
	}
}

func TestGameRedyToStart(t *testing.T) {
	online := newConnectFour(2, "online")
	if online.RedyToStart() {
		t.Fatal("online game must not be ready with 0 players")
	}
	_ = online.ConnectPlayer(1, "user1")
	_ = online.ConnectPlayer(2, "user2")
	if !online.RedyToStart() {
		t.Fatal("online game must be ready with 2 players")
	}

	local := newConnectFour(2, "local")
	if !local.RedyToStart() {
		t.Fatal("local game must always be ready")
	}
}

func TestGameFindPlayerByID(t *testing.T) {
	c := newConnectFour(2, "online")
	_ = c.ConnectPlayer(1, "user1")
	_ = c.ConnectPlayer(2, "user2")

	p := c.FindPlayerByID(2)
	if p == nil || p.ID != 2 {
		t.Fatalf("expected to find player 2")
	}
	if c.FindPlayerByID(99) != nil {
		t.Fatal("expected nil for unknown player")
	}
}

func TestGameProcessMoveReturnsBadRequestOnInvalidJSON(t *testing.T) {
	c := newConnectFour(2, "local")
	wantAppError(t, c.ProcessMove(0, json.RawMessage(`not json`)), http.StatusBadRequest)
}
