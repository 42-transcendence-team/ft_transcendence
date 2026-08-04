package games

import (
	appErr "backend/internal/errors"
	"encoding/json"
	"math/rand/v2"
)

type Goose struct {
	Game
	Board []Cell
	State map[uint]*GooseState
}

type GooseState struct {
	Position  int  `json:"position"`
	SkipTurns int  `json:"skip_turns"`
	InWell    bool `json:"in_well"`
	InPrison  bool `json:"in_prison"`
	ExtraTurn bool `json:"extra_turn"`
}

type Cell struct {
	Number int
	Type   CellType
}

type CellType int

const (
	CellNormal CellType = iota
	CellGoose
	CellBridge
	CellInn
	CellWell
	CellMaze
	CellPrison
	CellDice
	CellSkull
	CellFinish
)

func (g *Goose) GetState() interface{} { return g }

func (g *Goose) IsFinished() bool { return g.Finished }

func (g *Goose) Reset() {
	g.Init()
	g.Finished = false
	g.Winner = 0
}

func (g *Goose) GetWinner() (int, interface{}) {
	if g.Finished {
		for _, player := range g.Players {
			if player.Token == g.Winner {
				return g.Winner, player
			}
		}
	}
	return 0, nil
}

func (g *Goose) Init() {
	g.Board = make([]Cell, 64)
	g.State = make(map[uint]*GooseState)

	for i := 0; i <= 63; i++ {
		g.Board[i] = Cell{Number: i, Type: CellNormal}
	}

	for _, i := range []int{5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 63} {
		g.Board[i].Type = CellGoose
	}

	g.Board[6].Type = CellBridge
	g.Board[12].Type = CellBridge
	g.Board[19].Type = CellInn
	g.Board[31].Type = CellWell
	g.Board[26].Type = CellDice
	g.Board[53].Type = CellDice
	g.Board[42].Type = CellMaze
	g.Board[56].Type = CellPrison
	g.Board[58].Type = CellSkull

	g.Turn = 1
}

func (g *Goose) ConnectPlayer(userID uint, username string) error {
	err := g.Game.ConnectPlayer(userID, username)
	if err != nil {
		return err
	}

	player := g.FindPlayerByID(userID)
	if player != nil && player.Type == "player" {
		if _, exists := g.State[userID]; !exists {
			g.State[userID] = &GooseState{
				Position:  0,
				SkipTurns: 0,
				InWell:    false,
				InPrison:  false,
				ExtraTurn: false,
			}
		}
	}
	return nil
}

func (g *Goose) ProcessMove(userID uint, actionPayload json.RawMessage) error {
	player := g.FindPlayerByID(userID)
	if player == nil {
		return appErr.NewNotFound("jugador no encontrado")
	}

	if g.Turn != player.Token {
		return appErr.NewConflict("no es tu turno")
	}

	g.RollDice(player)
	state := g.State[player.ID]

	if state.ExtraTurn {
		state.ExtraTurn = false
		return nil
	}

	if !g.Finished && len(g.Players) > 0 {
		g.Turn = (g.Turn % len(g.Players)) + 1
	}
	return nil
}

func (g *Goose) RollDice(player *Player) {
	state := g.State[player.ID]

	if state.SkipTurns > 0 {
		state.SkipTurns--
		return
	}

	if state.InWell || state.InPrison {
		return
	}

	var d1, d2, total int

	if state.Position >= 60 {
		total = rand.IntN(6) + 1
	} else {
		d1 = rand.IntN(6) + 1
		d2 = rand.IntN(6) + 1
		total = d1 + d2

		switch state.Position {
		case 0:
			if total == 9 {
				if (d1 == 5 && d2 == 4) || (d1 == 4 && d2 == 5) {
					state.Position = 53
				} else if (d1 == 6 && d2 == 3) || (d1 == 3 && d2 == 6) {
					state.Position = 26
				}
				g.ResolveCell(player, true)
				return
			}
		}
	}

	g.MovePlayer(player, total)
}

func (g *Goose) MovePlayer(player *Player, steps int) {
	state := g.State[player.ID]
	state.Position += steps

	if state.Position > 63 {
		excess := state.Position - 63
		state.Position = 63 - excess
	}

	g.checkRescue(player.ID, state.Position)
	g.ResolveCell(player, false)
}

func (g *Goose) ResolveCell(player *Player, extraTurn bool) {
	state := g.State[player.ID]
	cell := g.Board[state.Position]

	switch cell.Type {
	case CellGoose:
		if state.Position == 63 {
			g.Winner = player.Token
			g.Finished = true
			return
		}
		state.Position = g.NextGoose(state.Position)
		if state.Position == 63 {
			g.Winner = player.Token
			g.Finished = true
			return
		}
		state.ExtraTurn = true

	case CellBridge:
		switch state.Position {
		case 6:
			state.Position = 12
		case 12:
			state.Position = 6
		}

	case CellInn:
		state.SkipTurns = 1

	case CellWell:
		state.InWell = true

	case CellMaze:
		state.Position = 30

	case CellPrison:
		state.InPrison = true

	case CellDice:
		switch state.Position {
		case 26:
			state.Position = 53
		case 53:
			state.Position = 26
		}

	case CellSkull:
		state.Position = 0

	case CellFinish:
		g.Winner = player.Token
		g.Finished = true
	}
}

func (g *Goose) NextGoose(position int) int {
	for i := position + 1; i <= 63; i++ {
		if g.Board[i].Type == CellGoose {
			return i
		}
	}
	return position
}

func (g *Goose) checkRescue(currentPlayerID uint, position int) {
	for id, s := range g.State {
		if id != currentPlayerID {
			if position == 31 && s.InWell {
				s.InWell = false
			}
			if position == 56 && s.InPrison {
				s.InPrison = false
			}
		}
	}
}
