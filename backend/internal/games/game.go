package games

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"encoding/json"
	"log"
	"sync"
	"time"
)

const reconnectTimeout = 10 * time.Second

type Game struct {
	ID         uint      `json:"id"`
	Players    []Player  `json:"players"`
	MaxPlayers int       `json:"max_players"`
	Type       string    `json:"type"`
	Turn       int       `json:"turn"`
	Mode       string    `json:"mode"`
	Finished   bool      `json:"is_finished"`
	Winner     int       `json:"winner,omitempty"`
	CreatedAt  time.Time `json:"created_at"`

	Events chan dto.GameEvent `json:"-"`

	mu             sync.Mutex                             `json:"-"`
	ReconnectTimer map[uint]*time.Timer                   `json:"-"`
	TimeoutPlayer  func(userID uint) (interface{}, error) `json:"-"`
	GetGameState   func() interface{}                     `json:"-"`
}

type Player struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Type      string    `json:"type"`
	Token     int       `json:"token"`
	Connected bool      `json:"connected"`
	LeftAt    time.Time `json:"left_at"`
}

type GameEngine interface {
	Init()
	ProcessMove(userID uint, actionPayload json.RawMessage) error
	GetState() interface{}
	GetType() string
	IsFinished() bool
	GetWinner() (int, interface{})
	DisconnectPlayer(userID uint) error
	ConnectPlayer(userID uint, username string) error
	PlayerTimeout(userID uint) (interface{}, error)
	GetPlayers() []Player
	RedyToStart() bool
}

func (g *Game) GetCurrentPlayer() int { return g.Turn }

func (g *Game) GetPlayers() []Player { return g.Players }

func (g *Game) GetType() string { return g.Type }

func (g *Game) SetTimeoutHandler(handler func(uint) (interface{}, error)) { g.TimeoutPlayer = handler }

func (g *Game) SetGetStateHandler(handler func() interface{}) { g.GetGameState = handler }

func (g *Game) FindPlayerByID(userID uint) *Player {
	for i := range g.Players {
		if g.Players[i].ID == userID {
			return &g.Players[i]
		}
	}
	return nil
}

func (g *Game) RedyToStart() bool {
	if g.Mode == "online" {
		return len(g.Players) == g.MaxPlayers
	}
	return true
}

func (g *Game) ConnectPlayer(userID uint, username string) error {
	if g.Mode == "local" && len(g.Players) >= 1 {
		return appErr.NewConflict("no se puede unir a un juego local")
	}

	if g.Mode == "online" && len(g.Players) >= g.MaxPlayers {
		err := g.reconnectPlayer(userID)
		if err != nil {
			newViwer := Player{
				ID:        userID,
				Type:      "viewer",
				Token:     0,
				Username:  username,
				Connected: true,
				LeftAt:    time.Time{},
			}
			g.Players = append(g.Players, newViwer)
			return nil
		}
		return nil
	}

	token := len(g.Players) + 1
	newPlayer := Player{
		ID:        userID,
		Type:      "player",
		Token:     token,
		Username:  username,
		Connected: true,
		LeftAt:    time.Time{},
	}
	g.Players = append(g.Players, newPlayer)
	return nil
}

func (g *Game) reconnectPlayer(userID uint) error {
	g.mu.Lock()
	defer g.mu.Unlock()

	player := g.FindPlayerByID(userID)
	if player == nil {
		log.Printf("Jugador %d no encontrado en el juego %d", userID, g.ID)
		return appErr.NewNotFound("jugador no encontrado")
	}

	player.Connected = true
	player.LeftAt = time.Time{}

	if timer, ok := g.ReconnectTimer[userID]; ok {
		timer.Stop()
		delete(g.ReconnectTimer, userID)
	}
	return nil
}

func (g *Game) DisconnectPlayer(userID uint) error {
	g.mu.Lock()
	defer g.mu.Unlock()

	player := g.FindPlayerByID(userID)
	if player == nil {
		log.Printf("Jugador %d no encontrado en el juego %d", userID, g.ID)
		return appErr.NewNotFound("jugador no encontrado")
	}

	player.Connected = false
	player.LeftAt = time.Now()

	if !g.Finished {
		g.StartReconnectTimer(userID)
	}
	return nil
}

func (g *Game) StartReconnectTimer(userID uint) {
	if timer, exists := g.ReconnectTimer[userID]; exists {
		timer.Stop()
	}

	g.ReconnectTimer[userID] = time.AfterFunc(reconnectTimeout, func() {
		if !g.Finished {
			state, err := g.TimeoutPlayer(userID)
			if err != nil {
				log.Printf("Error al manejar timeout del jugador %d: %v", userID, err)
				return
			}

			g.Events <- dto.GameEvent{
				Type:    "player_timeout",
				Payload: state,
				GameID:  g.ID,
				Status:  "TIMEOUT",
			}
		}
	})

	g.Events <- dto.GameEvent{
		Type:    "player_disconnected",
		Status:  "RECONNECTING",
		GameID:  g.ID,
		Payload: g.GetGameState(),
	}
}
