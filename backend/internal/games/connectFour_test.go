package games

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"encoding/json"
	"errors"
	"net/http"
	"testing"
)

func newConnectFour(players uint, mode string) *ConnectFour {
	return NewConnectFour(1, players, mode, "connect4", make(chan dto.GameEvent, 10))
}

func wantAppError(t *testing.T, err error, status int) {
	t.Helper()
	var ae *appErr.AppError
	if !errors.As(err, &ae) {
		t.Fatalf("expected *AppError, got %T: %v", err, err)
	}
	if ae.HTTPStatus != status {
		t.Fatalf("expected HTTP status %d, got %d (%s)", status, ae.HTTPStatus, ae.Message)
	}
}

func TestConnectFourDropsTokenWithGravity(t *testing.T) {
	c := newConnectFour(2, "local")

	if err := c.ProcessMove(0, json.RawMessage(`{"column":3}`)); err != nil {
		t.Fatalf("process move: %v", err)
	}

	if c.Board[5][3] != 1 {
		t.Fatalf("expected token at bottom of column, got %d", c.Board[5][3])
	}

	if err := c.ProcessMove(0, json.RawMessage(`{"column":3}`)); err != nil {
		t.Fatalf("process move: %v", err)
	}
	if c.Board[4][3] != 2 {
		t.Fatalf("expected second token stacked above, got %d", c.Board[4][3])
	}
}

func TestConnectFourTurnSwitches(t *testing.T) {
	c := newConnectFour(2, "local")
	if c.Turn != 1 {
		t.Fatalf("initial turn must be 1, got %d", c.Turn)
	}
	_ = c.ProcessMove(0, json.RawMessage(`{"column":0}`))
	if c.Turn != 2 {
		t.Fatalf("turn must switch to 2, got %d", c.Turn)
	}
}

func TestConnectFourRejectsFullColumn(t *testing.T) {
	c := newConnectFour(2, "local")
	for i := 0; i < 6; i++ {
		if err := c.ProcessMove(0, json.RawMessage(`{"column":0}`)); err != nil {
			t.Fatalf("move %d: %v", i, err)
		}
	}

	err := c.ProcessMove(0, json.RawMessage(`{"column":0}`))
	wantAppError(t, err, http.StatusConflict)
}

func TestConnectFourRejectsOutOfRangeColumn(t *testing.T) {
	c := newConnectFour(2, "local")
	wantAppError(t, c.ProcessMove(0, json.RawMessage(`{"column":7}`)), http.StatusBadRequest)
	wantAppError(t, c.ProcessMove(0, json.RawMessage(`{"column":-1}`)), http.StatusBadRequest)
}

func TestConnectFourHorizontalWin(t *testing.T) {
	c := newConnectFour(2, "local")
	c.Board[5][0] = 1
	c.Board[5][1] = 1
	c.Board[5][2] = 1
	c.Board[5][3] = 1

	winner, _ := c.GetWinner()
	if winner != 1 {
		t.Fatalf("expected player 1 to win horizontally, got %d", winner)
	}
	if !c.Finished {
		t.Fatal("game must be marked finished")
	}
}

func TestConnectFourVerticalWin(t *testing.T) {
	c := newConnectFour(2, "local")
	c.Board[0][0] = 1
	c.Board[1][0] = 1
	c.Board[2][0] = 1
	c.Board[3][0] = 1

	winner, _ := c.GetWinner()
	if winner != 1 {
		t.Fatalf("expected player 1 to win vertically, got %d", winner)
	}
}

func TestConnectFourDiagonalWin(t *testing.T) {
	c := newConnectFour(2, "local")
	c.Board[2][0] = 1
	c.Board[3][1] = 1
	c.Board[4][2] = 1
	c.Board[5][3] = 1

	winner, _ := c.GetWinner()
	if winner != 1 {
		t.Fatalf("expected player 1 to win diagonally, got %d", winner)
	}
}

func TestConnectFourIsFull(t *testing.T) {
	c := newConnectFour(2, "local")
	if c.IsFull() {
		t.Fatal("board must not be full initially")
	}
	for col := 0; col < 7; col++ {
		for row := 0; row < 6; row++ {
			c.Board[row][col] = 1
		}
	}
	if !c.IsFull() {
		t.Fatal("board must be full")
	}
}

func TestConnectFourOnlineNotYourTurn(t *testing.T) {
	c := newConnectFour(2, "online")
	_ = c.ConnectPlayer(1, "user1")
	_ = c.ConnectPlayer(2, "user2")

	wantAppError(t, c.ProcessMove(2, json.RawMessage(`{"column":0}`)), http.StatusConflict)
}

func TestConnectFourOnlineNeedsTwoPlayers(t *testing.T) {
	c := newConnectFour(2, "online")
	_ = c.ConnectPlayer(1, "user1")

	wantAppError(t, c.ProcessMove(1, json.RawMessage(`{"column":0}`)), http.StatusConflict)
}

func itoa(i int) string {
	return string(rune('0' + i))
}
