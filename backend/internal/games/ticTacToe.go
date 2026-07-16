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

func (t *TicTacToe) GetWinner() (int, [][2]int) {
	var winningLine [][2]int

	for i := 0; i < 3; i++ {
		if t.Board[i][0] != 0 && t.Board[i][0] == t.Board[i][1] && t.Board[i][1] == t.Board[i][2] {
			winningLine = append(winningLine, [2]int{i, 0}, [2]int{i, 1}, [2]int{i, 2})
			return t.Board[i][0], winningLine
		}
		if t.Board[0][i] != 0 && t.Board[0][i] == t.Board[1][i] && t.Board[1][i] == t.Board[2][i] {
			winningLine = append(winningLine, [2]int{0, i}, [2]int{1, i}, [2]int{2, i})
			return t.Board[0][i], winningLine
		}
	}

	if t.Board[0][0] != 0 && t.Board[0][0] == t.Board[1][1] && t.Board[1][1] == t.Board[2][2] {
		winningLine = append(winningLine, [2]int{0, 0}, [2]int{1, 1}, [2]int{2, 2})
		return t.Board[0][0], winningLine
	}
	if t.Board[0][2] != 0 && t.Board[0][2] == t.Board[1][1] && t.Board[1][1] == t.Board[2][0] {
		winningLine = append(winningLine, [2]int{0, 2}, [2]int{1, 1}, [2]int{2, 0})
		return t.Board[0][2], winningLine
	}

	return 0, nil
}

func (t *TicTacToe) Reset() {
	t.Board = [3][3]int{}
	t.Turn = 1
}

func (t *TicTacToe) GetCurrentPlayer() int {
	return t.Turn
}

func (t *TicTacToe) GetBoard() [3][3]int {
	return t.Board
}

func (t *TicTacToe) GetState() interface{} { return t }
func (t *TicTacToe) IsFinished() bool      { return false }
