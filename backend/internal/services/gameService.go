package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
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

func (gm *GameManager) CreateGame(id, players uint, gameType, mode string, events chan dto.GameEvent) error {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	var engine games.GameEngine

	switch gameType {
	case "TICTACTOE":
		engine = games.NewTicTacToe(id, players, mode, gameType, events)
	case "CONNECTFOUR":
		engine = games.NewConnectFour(id, players, mode, gameType, events)
	case "GOOSE":
		engine = games.NewGoose(id, players, mode, gameType, events)
	default:
		return appErr.NewBadRequest(fmt.Sprintf("tipo de juego desconocido: %s", gameType))
	}

	gm.ActiveGames[id] = engine
	return nil
}

func (gm *GameManager) GetGame(id uint) (games.GameEngine, bool) {
	gm.mu.RLock()
	defer gm.mu.RUnlock()

	engine, exists := gm.ActiveGames[id]
	return engine, exists
}

func (gm *GameManager) LeaveGame(gameID, userID uint) (interface{}, error) {
	engine, ok := gm.GetGame(gameID)
	if !ok {
		return nil, appErr.NewNotFound(
			fmt.Sprintf("juego con ID %d no encontrado", gameID),
		)
	}

	if err := engine.DisconnectPlayer(userID); err != nil {
		return nil, err
	}

	state := engine.GetState()

	if gm.shouldRemove(engine) {
		gm.mu.Lock()
		delete(gm.ActiveGames, gameID)
		gm.mu.Unlock()

		return state, nil
	}

	return state, nil
}

func (gm *GameManager) shouldRemove(engine games.GameEngine) bool {
	for _, player := range engine.GetPlayers() {
		if player.Connected {
			return false
		}
	}

	log.Printf("Todos los jugadores han abandonado el juego")
	return true
}
