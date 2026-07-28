package services

import (
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

func (gm *GameManager) CreateGame(id uint, gameType, mode string) error {
	gm.mu.Lock()
	defer gm.mu.Unlock()
	if gameType == "TICTACTOE" {
		gm.ActiveGames[id] = games.NewTicTacToe(id, mode, gameType)
	} else {
		log.Printf("Tipo de juego desconocido: %s", gameType)
		return fmt.Errorf("tipo de juego desconocido: %s", gameType)
	}
	return nil
}
