package games

import (
	appErr "backend/internal/errors"
	"encoding/json"
)

// TODO - Gestionar partidas online y offline, y que el juego sepa si es online o local. Ahora funciona local
type TicTacToe struct {
	Game
	Board [3][3]int `json:"board"` // 0: vacio, 1: X, 2: O
}

func (t *TicTacToe) Init() {
	t.Board = [3][3]int{}
	t.Turn = 1
}

func NewTicTacToe(mode string) *TicTacToe {
	return &TicTacToe{
		Game:  Game{Turn: 1, Players: make([]Player, 0, 2), Mode: mode},
		Board: [3][3]int{}}
}

func (t *TicTacToe) GetCurrentPlayer() int { return t.Turn }

func (t *TicTacToe) GetBoard() [3][3]int { return t.Board }

func (t *TicTacToe) GetState() interface{} { return t }

func (t *TicTacToe) IsFinished() bool { return false }

func (t *TicTacToe) GetPlayers() []Player { return t.Players }

func (t *TicTacToe) LeaveGame(userID uint) error { return t.RemovePlayer(userID) }

func (t *TicTacToe) Reset() {
	t.Board = [3][3]int{}
	t.Turn = 1
}

func (t *TicTacToe) ProcessMove(userID uint, moveData json.RawMessage) error {
	type Move struct{ Row, Col int }
	var m Move
	json.Unmarshal(moveData, &m)

	if t.IsFinished() {
		return appErr.NewConflict("el juego ya ha terminado")
	}

	if t.Mode == "online" {
		if len(t.Players) < 2 {
			return appErr.NewConflict("no hay suficientes jugadores para jugar")
		}

		currentTurnToken := t.Turn
		isMyTurn := false
		for _, player := range t.Players {
			if player.ID == userID {
				if player.Token != currentTurnToken {
					return appErr.NewConflict("no es tu turno")
				}
				isMyTurn = true
				break
			}
		}

		if !isMyTurn {
			return appErr.NewConflict("no eres un jugador en este juego")
		}
	}

	if m.Row < 0 || m.Row > 2 || m.Col < 0 || m.Col > 2 {
		return appErr.NewConflict("movimiento fuera de los límites del tablero")
	}

	if t.Board[m.Row][m.Col] != 0 {
		return appErr.NewConflict("casilla ocupada")
	}

	t.Board[m.Row][m.Col] = t.Turn
	t.Turn = 3 - t.Turn
	return nil
}

func (t *TicTacToe) GetWinner() (int, interface{}) {
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

func (t *TicTacToe) IsFull() bool {
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if t.Board[i][j] == 0 {
				return false
			}
		}
	}
	return true
}
