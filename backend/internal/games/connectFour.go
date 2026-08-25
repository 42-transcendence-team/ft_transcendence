package games

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"encoding/json"
	"time"
)

type ConnectFour struct {
	Game
	Board [6][7]int `json:"board"` // 0: vacio, 1: jugador 1, 2: jugador 2
}

func (c *ConnectFour) Init() {
	c.Board = [6][7]int{}
	c.Turn = 1
}

func NewConnectFour(id, players uint, mode, gameType string, events chan dto.GameEvent) *ConnectFour {
	c := &ConnectFour{
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
		Board: [6][7]int{},
	}
	c.TimeoutPlayer = c.PlayerTimeout
	c.GetGameState = c.GetState
	return c
}

func (c *ConnectFour) GetBoard() [6][7]int { return c.Board }

func (c *ConnectFour) GetState() interface{} { return c }

func (c *ConnectFour) IsFinished() bool { return c.IsFull() }

func (c *ConnectFour) Reset() {
	c.Board = [6][7]int{}
	c.Turn = 1
}

func (c *ConnectFour) ProcessMove(userID uint, moveData json.RawMessage) error {
	type Move struct{ Column int }
	var m Move
	if err := json.Unmarshal(moveData, &m); err != nil {
		return appErr.NewBadRequest("datos de movimiento inválidos")
	}

	if c.IsFinished() {
		return appErr.NewConflict("el juego ya ha terminado")
	}

	if c.Mode == "online" {
		if len(c.Players) < 2 {
			return appErr.NewConflict("no hay suficientes jugadores para comenzar el juego")
		}

		currentTurnToken := c.Turn
		isPlayerTurn := false
		for _, p := range c.Players {
			if p.ID == userID && p.Token == currentTurnToken {
				isPlayerTurn = true
				break
			}
		}

		if !isPlayerTurn {
			return appErr.NewConflict("no es tu turno")
		}
	}

	if m.Column < 0 || m.Column >= 7 {
		return appErr.NewBadRequest("columna inválida")
	}

	if c.Board[0][m.Column] != 0 {
		return appErr.NewConflict("columna llena")
	}

	for row := 5; row >= 0; row-- {
		if c.Board[row][m.Column] == 0 {
			c.Board[row][m.Column] = c.Turn
			break
		}
	}
	c.Turn = 3 - c.Turn
	return nil
}

func (c *ConnectFour) IsFull() bool {
	for col := 0; col < 7; col++ {
		if c.Board[0][col] == 0 {
			return false
		}
	}
	return true
}

func (c *ConnectFour) GetWinner() (int, interface{}) {
	for row := 0; row < 6; row++ {
		for col := 0; col < 7; col++ {
			player := c.Board[row][col]
			if player == 0 {
				continue
			}
			if col <= 3 && player == c.Board[row][col+1] && player == c.Board[row][col+2] && player == c.Board[row][col+3] {
				winningLine := [][2]int{{row, col}, {row, col + 1}, {row, col + 2}, {row, col + 3}}
				c.Winner = player
				c.Finished = true
				return player, winningLine
			}
			if row <= 2 && player == c.Board[row+1][col] && player == c.Board[row+2][col] && player == c.Board[row+3][col] {
				winningLine := [][2]int{{row, col}, {row + 1, col}, {row + 2, col}, {row + 3, col}}
				c.Winner = player
				c.Finished = true
				return player, winningLine
			}
			if row >= 3 && col <= 3 && player == c.Board[row-1][col+1] && player == c.Board[row-2][col+2] && player == c.Board[row-3][col+3] {
				winningLine := [][2]int{{row, col}, {row - 1, col + 1}, {row - 2, col + 2}, {row - 3, col + 3}}
				c.Winner = player
				c.Finished = true
				return player, winningLine
			}
			if row <= 2 && col <= 3 && player == c.Board[row+1][col+1] && player == c.Board[row+2][col+2] && player == c.Board[row+3][col+3] {
				winningLine := [][2]int{{row, col}, {row + 1, col + 1}, {row + 2, col + 2}, {row + 3, col + 3}}
				c.Winner = player
				c.Finished = true
				return player, winningLine
			}
		}
	}
	return 0, nil
}

func (c *ConnectFour) PlayerTimeout(userID uint) (interface{}, error) {
	player := c.FindPlayerByID(userID)
	if player == nil {
		return nil, appErr.NewNotFound("jugador no encontrado")
	}

	for _, p := range c.Players {
		if p.Type != "player" {
			continue
		}

		if p.ID != userID && p.Connected {
			c.Winner = p.Token
			break
		}
	}
	c.Finished = true
	return c.GetState(), nil
}
