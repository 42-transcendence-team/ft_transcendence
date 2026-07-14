package services

import (
	"backend/internal/games"
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

func (gm *GameManager) CreateGame(id string, gameType string) {
	gm.mu.Lock()
	defer gm.mu.Unlock()
	if gameType == "TICTACTOE" {
		gm.ActiveGames[id] = games.NewTicTacToe()
	}
}
