package games

import (
	appErr "backend/internal/errors"
	"encoding/json"
	"log"
	"time"
)

type Game struct {
	ID         uint      `json:"id"`
	Name       string    `json:"name"`
	Players    []Player  `json:"players"`
	Type       string    `json:"type"`
	Turn       int       `json:"turn"`
	Mode       string    `json:"mode"`
	IsFinished bool      `json:"is_finished"`
	Winner     Player    `json:"winner"`
	CreatedAt  time.Time `json:"created_at"`
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
	IsFinished() bool
	GetWinner() (int, interface{}) // TODO - Revisar como pasar Player y no winner como int (Para online creo que furula bien pero en local no coge cunado ganan O bien)
	DisconnectPlayer(userID uint) error
	ConnectPlayer(userID uint, username string) error
}

func (g *Game) GetCurrentPlayer() int { return g.Turn }

func (g *Game) GetPlayers() []Player { return g.Players }

func (g *Game) ConnectPlayer(userID uint, username string) error {
	if g.Mode == "local" && len(g.Players) >= 1 {
		return appErr.NewConflict("no se puede unir a un juego local")
	}

	if g.Mode == "online" && len(g.Players) >= 2 {
		err := g.ReconnectPlayer(userID)
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
			log.Printf("Jugador %d añadido como espectador al juego %d", userID, g.ID)
			return nil
		}
		log.Printf("Jugador %d reconectado al juego %d", userID, g.ID)
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

func (g *Game) RemovePlayer(userID uint) error {
	for i, player := range g.Players {
		if player.ID == userID {
			g.Players = append(g.Players[:i], g.Players[i+1:]...)
			return nil
		}
	}
	return appErr.NewNotFound("jugador no encontrado")
}

func (g *Game) ReconnectPlayer(userID uint) error {
	for i, player := range g.Players {
		if player.ID == userID && !g.Players[i].Connected {
			g.Players[i].Connected = true
			g.Players[i].LeftAt = time.Time{}
			return nil
		}
	}
	return appErr.NewNotFound("jugador no encontrado")
}

func (g *Game) DisconnectPlayer(userID uint) error {
	for i, player := range g.Players {
		if player.ID == userID {
			g.Players[i].Connected = false
			g.Players[i].LeftAt = time.Now()
			log.Printf("Jugador %d desconectado del juego %d", userID, g.ID)
			return nil
		}
	}
	return appErr.NewNotFound("jugador no encontrado")
}
