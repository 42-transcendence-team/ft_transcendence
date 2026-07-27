package services

import (
	"backend/internal/games"
	"fmt"
	"log"
	"sync"
)

type GameManager struct {
	mu          sync.RWMutex
	ActiveGames map[string]games.GameEngine
}

func NewGameManager() *GameManager {
	return &GameManager{
		ActiveGames: make(map[string]games.GameEngine),
	}
}

func (gm *GameManager) CreateGame(id, gameType, mode string) error {
	gm.mu.Lock()
	defer gm.mu.Unlock()
	if gameType == "TICTACTOE" {
		gm.ActiveGames[id] = games.NewTicTacToe(mode)
	} else {
		log.Printf("Tipo de juego desconocido: %s", gameType)
		return fmt.Errorf("tipo de juego desconocido: %s", gameType)
	}
	return nil
}
