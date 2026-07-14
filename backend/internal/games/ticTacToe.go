package games

import (
	"encoding/json"
	"errors"
)

type TicTacToe struct {
	Board [3][3]int `json:"board"` // 0: vacio, 1: X, 2: O
	Turn  int       `json:"turn"`  // 1 o 2
}

func (t *TicTacToe) Init() {
	t.Board = [3][3]int{}
	t.Turn = 1
}

func NewTicTacToe() *TicTacToe {
	return &TicTacToe{Turn: 1}
}

func (t *TicTacToe) ProcessMove(userID uint, moveData json.RawMessage) error {
	type Move struct{ Row, Col int }
	var m Move
	json.Unmarshal(moveData, &m)

	if t.Board[m.Row][m.Col] != 0 {
		return errors.New("casilla ocupada")
	}

	t.Board[m.Row][m.Col] = t.Turn
	t.Turn = 3 - t.Turn
	return nil
}

func (t *TicTacToe) GetState() interface{} { return t }
func (t *TicTacToe) IsFinished() bool      { return false }
