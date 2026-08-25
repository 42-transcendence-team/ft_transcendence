package games

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"encoding/json"
	"time"
)

type TicTacToe struct {
	Game
	Board [3][3]int `json:"board"` // 0: vacio, 1: X, 2: O
}

func (t *TicTacToe) Init() {
	t.Board = [3][3]int{}
	t.Turn = 1
}

func NewTicTacToe(id, players uint, mode, gameType string, events chan dto.GameEvent) *TicTacToe {
	t := &TicTacToe{
		Game: Game{
			Turn:           1,
			Players:        make([]Player, 0, players),
			MaxPlayers:     int(players),
			Mode:           mode,
			ID:             id,
			Type:           gameType,
			CreatedAt:      time.Now(),
			ReconnectTimer: make(map[uint]*time.Timer),
			Events:         events,
		},
		Board: [3][3]int{},
	}
	t.TimeoutPlayer = t.PlayerTimeout
	t.GetGameState = t.GetState
	return t
}

func (t *TicTacToe) GetBoard() [3][3]int { return t.Board }

func (t *TicTacToe) GetState() interface{} { return t }

func (t *TicTacToe) IsFinished() bool { return t.IsFull() }

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
			t.Winner = t.Board[i][0]
			t.Finished = true
			return t.Winner, winningLine
		}
		if t.Board[0][i] != 0 && t.Board[0][i] == t.Board[1][i] && t.Board[1][i] == t.Board[2][i] {
			winningLine = append(winningLine, [2]int{0, i}, [2]int{1, i}, [2]int{2, i})
			t.Winner = t.Board[0][i]
			t.Finished = true
			return t.Winner, winningLine
		}
	}

	if t.Board[0][0] != 0 && t.Board[0][0] == t.Board[1][1] && t.Board[1][1] == t.Board[2][2] {
		winningLine = append(winningLine, [2]int{0, 0}, [2]int{1, 1}, [2]int{2, 2})
		t.Winner = t.Board[0][0]
		t.Finished = true
		return t.Winner, winningLine
	}
	if t.Board[0][2] != 0 && t.Board[0][2] == t.Board[1][1] && t.Board[1][1] == t.Board[2][0] {
		winningLine = append(winningLine, [2]int{0, 2}, [2]int{1, 1}, [2]int{2, 0})
		t.Winner = t.Board[0][2]
		t.Finished = true
		return t.Winner, winningLine
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
	t.Finished = true
	return true
}

func (t *TicTacToe) PlayerTimeout(userID uint) (interface{}, error) {
	player := t.FindPlayerByID(userID)
	if player == nil {
		return nil, appErr.NewNotFound("jugador no encontrado")
	}

	for _, p := range t.Players {
		if p.ID != userID && p.Type == "player" {
			t.Winner = p.Token
			break
		}
	}

	t.Finished = true
	return t.GetState(), nil
}
