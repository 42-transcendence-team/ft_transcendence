package services

import (
	"backend/internal/dto"
	"backend/internal/games"
	"fmt"
	"log"
	"sync"
)

type GameManager struct {
	mu          sync.RWMutex
	ActiveGames map[uint]games.GameEngine
}

func NewGameManager() *GameManager {
	return &GameManager{
		ActiveGames: make(map[uint]games.GameEngine),
	}
}

func (gm *GameManager) CreateGame(id uint, gameType, mode string, events chan dto.GameEvent) error {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	var engine games.GameEngine

	switch gameType {
	case "TICTACTOE":
		engine = games.NewTicTacToe(id, mode, gameType, events)
	case "CONNECTFOUR":
		engine = games.NewConnectFour(id, mode, gameType, events)
	default:
		log.Printf("Tipo de juego desconocido: %s", gameType)
		return fmt.Errorf("tipo de juego desconocido: %s", gameType)
	}

	gm.ActiveGames[id] = engine
	return nil
}
