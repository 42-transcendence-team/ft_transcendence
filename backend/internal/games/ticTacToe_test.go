package games

import (
	"backend/internal/dto"
	"encoding/json"
	"net/http"
	"testing"
)

func newTicTacToe(players uint, mode string) *TicTacToe {
	return NewTicTacToe(1, players, mode, "ticTacToe", make(chan dto.GameEvent, 10))
}

func TestTicTacToePlacesToken(t *testing.T) {
	tt := newTicTacToe(2, "local")
	if err := tt.ProcessMove(0, json.RawMessage(`{"row":1,"col":1}`)); err != nil {
		t.Fatalf("process move: %v", err)
	}
	if tt.Board[1][1] != 1 {
		t.Fatalf("expected X at (1,1), got %d", tt.Board[1][1])
	}
	if tt.Turn != 2 {
		t.Fatalf("expected turn 2, got %d", tt.Turn)
	}
}

func TestTicTacToeRejectsOccupiedCell(t *testing.T) {
	tt := newTicTacToe(2, "local")
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":0}`))
	wantAppError(t, tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":0}`)), http.StatusConflict)
}

func TestTicTacToeRejectsOutOfBounds(t *testing.T) {
	tt := newTicTacToe(2, "local")
	wantAppError(t, tt.ProcessMove(0, json.RawMessage(`{"row":3,"col":0}`)), http.StatusConflict)
	wantAppError(t, tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":-1}`)), http.StatusConflict)
}

func TestTicTacToeRowWin(t *testing.T) {
	tt := newTicTacToe(2, "local")
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":0}`)) // 1
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":1,"col":0}`)) // 2
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":1}`)) // 1
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":1,"col":1}`)) // 2
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":2}`)) // 1 wins

	winner, _ := tt.GetWinner()
	if winner != 1 {
		t.Fatalf("expected player 1 to win by row, got %d", winner)
	}
}

func TestTicTacToeDiagonalWin(t *testing.T) {
	tt := newTicTacToe(2, "local")
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":0}`)) // 1
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":1}`)) // 2
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":1,"col":1}`)) // 1
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":0,"col":2}`)) // 2
	_ = tt.ProcessMove(0, json.RawMessage(`{"row":2,"col":2}`)) // 1 wins

	winner, _ := tt.GetWinner()
	if winner != 1 {
		t.Fatalf("expected player 1 to win diagonally, got %d", winner)
	}
}

func TestTicTacToeIsFullDraw(t *testing.T) {
	tt := newTicTacToe(2, "local")
	tt.Board = [3][3]int{
		{1, 2, 1},
		{1, 2, 2},
		{2, 1, 1},
	}

	if !tt.IsFull() {
		t.Fatal("board must be full")
	}
	if winner, _ := tt.GetWinner(); winner != 0 {
		t.Fatalf("expected no winner, got %d", winner)
	}
}

func TestTicTacToeOnlineTurnEnforcement(t *testing.T) {
	tt := newTicTacToe(2, "online")
	_ = tt.ConnectPlayer(1, "user1")
	_ = tt.ConnectPlayer(2, "user2")

	wantAppError(t, tt.ProcessMove(2, json.RawMessage(`{"row":0,"col":0}`)), http.StatusConflict)
}
