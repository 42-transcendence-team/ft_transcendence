package games

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"encoding/json"
	"log"
	"math/rand/v2"
	"time"
)

type Goose struct {
	Game
	Board   []Cell               `json:"board"`
	State   map[uint]*GooseState `json:"playerstate"`
	Actions []GooseAction        `json:"actions,omitempty"`
}

type GooseState struct {
	Position  uint `json:"position"`
	SkipTurns int  `json:"skip_turns"`
	InWell    bool `json:"in_well"`
	InPrison  bool `json:"in_prison"`
	Token     int  `json:"token"`
}

type GooseAction struct {
	Type    string `json:"type"`
	Token   int    `json:"token,omitempty"`
	From    uint   `json:"from"`
	To      uint   `json:"to,omitempty"`
	Dice1   uint   `json:"dice1,omitempty"`
	Dice2   uint   `json:"dice2,omitempty"`
	Message string `json:"payload,omitempty"`
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
)

func NewGoose(id, players uint, mode, gameType string, events chan dto.GameEvent) *Goose {
	g := &Goose{
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
		Board: make([]Cell, 64),
		State: make(map[uint]*GooseState),
	}
	g.TimeoutPlayer = g.PlayerTimeout
	g.GetGameState = g.GetState
	g.Init()
	return g
}

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

	if g.Mode == "local" {
		for i := 1; i <= g.MaxPlayers; i++ {
			g.State[uint(i)] = &GooseState{
				Position:  0,
				SkipTurns: 0,
				InWell:    false,
				InPrison:  false,
				Token:     i,
			}
		}
	}

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
				Token:     len(g.Players),
			}
		}
	}
	return nil
}

func (g *Goose) ProcessMove(userID uint, actionPayload json.RawMessage) error {
	if g.Finished {
		return appErr.NewConflict("el juego ya ha terminado")
	}

	var playerID uint

	if g.Mode == "online" {
		if len(g.Players) < 2 {
			return appErr.NewConflict("no hay suficientes jugadores para jugar")
		}

		player := g.FindPlayerByID(userID)
		if player == nil {
			return appErr.NewNotFound("jugador no encontrado")
		}

		if g.Turn != player.Token {
			return appErr.NewConflict("no es tu turno")
		}

		playerID = player.ID
	} else {
		playerID = uint(g.Turn)
	}

	g.Actions = g.RollDice(playerID)

	if !g.Finished && len(g.Players) > 0 {
		g.Turn = (g.Turn % int(g.MaxPlayers)) + 1
	}

	return nil
}

func (g *Goose) RollDice(playerId uint) []GooseAction {
	state := g.State[playerId]

	actions := make([]GooseAction, 0)

	if state.SkipTurns > 0 {
		state.SkipTurns--
		actions = append(actions, GooseAction{
			Type:    "skip_turn",
			Token:   state.Token,
			Message: "Pierde un turno",
		})
		return actions
	}

	if state.InWell {
		actions = append(actions, GooseAction{
			Type:    "well",
			Token:   state.Token,
			Message: "Sigue en el pozo",
		})
		return actions
	}

	if state.InPrison {
		actions = append(actions, GooseAction{
			Type:    "prison",
			Token:   state.Token,
			Message: "Sigue en la cárcel",
		})
		return actions
	}

	for {
		var d1, d2, total uint
		if state.Position >= 60 {
			d1 = uint(rand.IntN(6) + 1)
			total = d1
		} else {
			d1 = uint(rand.IntN(6) + 1)
			d2 = uint(rand.IntN(6) + 1)
			total = d1 + d2
		}

		actions = append(actions, GooseAction{
			Type:  "roll",
			Dice1: d1,
			Dice2: d2,
			Token: state.Token,
		})

		old := state.Position

		if old == 0 && total == 9 {
			if (d1 == 5 && d2 == 4) || (d1 == 4 && d2 == 5) {
				state.Position = 53
			} else if (d1 == 6 && d2 == 3) || (d1 == 3 && d2 == 6) {
				state.Position = 26
			}
			actions = append(actions, GooseAction{
				Type:  "move",
				From:  old,
				To:    state.Position,
				Token: state.Token,
			})
			return actions
		} else {
			g.MovePlayer(playerId, total)
			actions = append(actions, GooseAction{
				Type:  "move",
				From:  old,
				To:    state.Position,
				Token: state.Token,
			})
		}

		extra := g.ResolveCell(playerId, &actions)

		if !extra {
			break
		}
	}
	log.Printf("Actions for player %d: %+v", playerId, actions)

	return actions
}

func (g *Goose) MovePlayer(playerId uint, steps uint) {
	state := g.State[playerId]
	state.Position += steps

	if state.Position > 63 {
		excess := state.Position - 63
		state.Position = 63 - excess
	}

	g.checkRescue(playerId, state.Position)
}

func (g *Goose) CheckFinish(playerID uint, actions *[]GooseAction) bool {
	state := g.State[playerID]

	if state.Position != 63 {
		return false
	}

	g.Finished = true
	g.Winner = state.Token
	log.Printf("Player %d has won the game!", playerID)

	*actions = append(*actions, GooseAction{
		Type:    "finish",
		To:      state.Position,
		Token:   state.Token,
		Message: "¡Has llegado a la meta!",
	})

	return true
}

func (g *Goose) ResolveCell(playerId uint, actions *[]GooseAction) bool {
	state := g.State[playerId]

	if g.CheckFinish(playerId, actions) {
		return false
	}

	switch g.Board[state.Position].Type {
	case CellGoose:
		old := state.Position
		state.Position = g.NextGoose(old)

		*actions = append(*actions, GooseAction{
			Type:    "goose",
			From:    old,
			To:      state.Position,
			Message: "De oca a oca y tiro porque me toca",
			Token:   state.Token,
		})

		if g.CheckFinish(playerId, actions) {
			return false
		}

		return true

	case CellBridge:
		old := state.Position
		if old == 6 {
			state.Position = 12
		} else {
			state.Position = 6
		}
		*actions = append(*actions, GooseAction{
			Type:    "bridge",
			From:    old,
			To:      state.Position,
			Message: "De puente a puente",
			Token:   state.Token,
		})
		return true

	case CellDice:
		old := state.Position
		var rawTarget uint

		if old == 26 {
			rawTarget = old + 26
		} else {
			rawTarget = old + 53
		}

		if rawTarget > 63 {
			state.Position = 126 - rawTarget
		} else {
			state.Position = rawTarget
		}

		*actions = append(*actions, GooseAction{
			Type:    "dice",
			From:    old,
			To:      state.Position,
			Message: "De dados a dados",
			Token:   state.Token,
		})
		return true

	case CellInn:
		state.SkipTurns = 1
		*actions = append(*actions, GooseAction{
			Type:    "inn",
			Message: "Te quedas en la posada y pierdes un turno",
			Token:   state.Token,
		})

	case CellWell:
		state.InWell = true
		*actions = append(*actions, GooseAction{
			Type:    "well",
			Message: "Caes en el pozo y pierdes turnos hasta que otro jugador caiga aquí",
			Token:   state.Token,
		})

	case CellPrison:
		state.InPrison = true
		*actions = append(*actions, GooseAction{
			Type:    "prison",
			Message: "Caes en la cárcel y pierdes turnos hasta que otro jugador caiga aquí",
			Token:   state.Token,
		})

	case CellMaze:
		old := state.Position
		state.Position = 30
		*actions = append(*actions, GooseAction{
			Type:    "maze",
			From:    old,
			To:      30,
			Message: "Entras en el laberinto",
			Token:   state.Token,
		})

	case CellSkull:
		old := state.Position
		state.Position = 1
		*actions = append(*actions, GooseAction{
			Type:    "skull",
			From:    old,
			To:      1,
			Message: "La calavera te devuelve al inicio",
			Token:   state.Token,
		})
	}

	return false
}

func (g *Goose) NextGoose(position uint) uint {
	for i := position + 1; i <= 63; i++ {
		if g.Board[i].Type == CellGoose {
			return i
		}
	}
	return position
}

func (g *Goose) checkRescue(currentPlayerID uint, position uint) {
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

func (g *Goose) PlayerTimeout(userID uint) (interface{}, error) {
	player := g.FindPlayerByID(userID)
	if player == nil {
		return nil, appErr.NewNotFound("jugador no encontrado")
	}

	g.Finished = true

	return g.GetState(), nil
}
