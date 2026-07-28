package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	ws "backend/internal/websocket"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type GameHandler struct {
	gameManager *services.GameManager
	hub         *ws.Hub
}

func NewGameHandler(gameManager *services.GameManager, hub *ws.Hub) *GameHandler {
	return &GameHandler{
		gameManager: gameManager,
		hub:         hub,
	}
}

func (gh *GameHandler) HandleGameMessage(c ws.ClientConn, msg *dto.IncomingMessage) {
	if len(msg.Payload) == 0 {
		log.Printf("Error: El payload del juego está vacío")
		return
	}

	var actionEnvelope dto.GameAction
	if err := json.Unmarshal(msg.Payload, &actionEnvelope); err != nil {
		log.Printf("Error al decodificar la acción base: %v", err)
		return
	}

	log.Printf("Acción recibida: %s", actionEnvelope.Action)

	switch actionEnvelope.Action {

	case "create":
		gh.HandleCreateGame(c, msg)

	case "make_move":
		gh.HandleMakeMove(c, msg)

	case "join":
		gh.HandleJoinGame(c, msg)

	case "leave":
		gh.HandleLeaveGame(c, msg)

	default:
		log.Printf("Acción de juego desconocida: %s", actionEnvelope.Action)
	}
}

func (gh *GameHandler) HandleCreateGame(c ws.ClientConn, msg *dto.IncomingMessage) {
	var createData dto.CreateGame
	err := json.Unmarshal(msg.Payload, &createData)
	if err != nil {
		log.Printf("Error al decodificar CreateGame: %v", err)
		return
	}

	newGameID := fmt.Sprintf("%d", time.Now().Unix())

	err = gh.gameManager.CreateGame(newGameID, createData.GameType, createData.Mode)
	if err != nil {
		log.Printf("Error al crear el juego: %v", err)
		return
	}

	state := gh.gameManager.ActiveGames[newGameID].GetState()

	var roomID64 uint
	_, err = fmt.Sscanf(newGameID, "%d", &roomID64)
	if err != nil {
		log.Printf("Error al convertir GameID %s a uint: %v", newGameID, err)
		return
	}
	roomID := uint(roomID64)

	room := gh.hub.CreateRoom(roomID, fmt.Sprintf("Game-%s", newGameID), false)

	c.JoinRoom(room)

	var data map[string]interface{}
	if createData.Mode == "online" {
		data = map[string]interface{}{
			"game_id":   newGameID,
			"game_type": createData.GameType,
			"mode":      createData.Mode,
			"status":    "LOBBY",
			"state":     state,
		}
	} else {
		data = map[string]interface{}{
			"game_id":   newGameID,
			"game_type": createData.GameType,
			"mode":      createData.Mode,
			"status":    "PLAY",
			"state":     state,
		}
	}

	err = gh.gameManager.ActiveGames[newGameID].AddPlayer(c.GetUserID(), c.GetUsername())
	if err != nil {
		log.Printf("Error al unir al jugador: %v", err)
		return
	}

	response := map[string]interface{}{
		"type":    "game_created",
		"payload": data,
	}

	log.Printf("Juego creado con ID: %s, Tipo: %s, Modo: %s", newGameID, createData.GameType, createData.Mode)

	responseBytes, _ := json.Marshal(response)
	c.Send(responseBytes)
}

func (gh *GameHandler) HandleJoinGame(c ws.ClientConn, msg *dto.IncomingMessage) {
	var joinData dto.JoinGame
	err := json.Unmarshal(msg.Payload, &joinData)
	if err != nil {
		log.Printf("Error al decodificar JoinGame: %v", err)
		return
	}

	var roomID64 uint
	_, err = fmt.Sscanf(joinData.GameID, "%d", &roomID64)
	if err != nil {
		log.Printf("Error al convertir GameID %s a uint: %v", joinData.GameID, err)
		return
	}
	roomID := uint(roomID64)

	room := gh.hub.CreateRoom(roomID, fmt.Sprintf("Game-%s", joinData.GameID), false)

	c.JoinRoom(room)

	engine, ok := gh.gameManager.ActiveGames[joinData.GameID]
	if !ok {
		log.Printf("Error: Partida %s no existe en GameManager", joinData.GameID)
		return
	}

	err = engine.AddPlayer(c.GetUserID(), c.GetUsername())
	if err != nil {
		log.Printf("Error al unir al jugador: %v", err)
		return
	}

	broadcast := map[string]interface{}{
		"type":   "game_update",
		"state":  engine.GetState(),
		"status": "PLAY",
	}
	broadcastBytes, _ := json.Marshal(broadcast)

	gh.hub.BroadcastToRoom(roomID, broadcastBytes)
}

func (gh *GameHandler) HandleLeaveGame(c ws.ClientConn, msg *dto.IncomingMessage) {
	var leaveData dto.LeaveGame
	err := json.Unmarshal(msg.Payload, &leaveData)
	if err != nil {
		log.Printf("Error al decodificar LeaveGame: %v", err)
		return
	}

	log.Printf("Usuario %d abandonó la partida %s", c.GetUserID(), leaveData.GameID)

	err = gh.gameManager.ActiveGames[leaveData.GameID].DisconnectPlayer(c.GetUserID())
	if err != nil {
		log.Printf("Error al abandonar la partida: %v", err)
		return
	}

	var roomID64 uint
	_, err = fmt.Sscanf(leaveData.GameID, "%d", &roomID64)
	if err != nil {
		log.Printf("Error al convertir GameID %s a uint: %v", leaveData.GameID, err)
		return
	}
	roomID := uint(roomID64)

	room, exists := gh.hub.GetRoom(roomID)
	if !exists {
		log.Printf("Error: Sala %d no existe en Hub", roomID)
		return
	}
	broadcast := map[string]interface{}{
		"type":  "game_update",
		"state": gh.gameManager.ActiveGames[leaveData.GameID].GetState(),
	}
	broadcastBytes, _ := json.Marshal(broadcast)

	gh.hub.BroadcastToRoom(roomID, broadcastBytes)

	c.LeaveRoom(room)
}

func (gh *GameHandler) HandleMakeMove(c ws.ClientConn, msg *dto.IncomingMessage) {
	var moveData dto.MakeMove
	err := json.Unmarshal(msg.Payload, &moveData)
	if err != nil {
		log.Printf("Error al decodificar MakeMove: %v", err)
		return
	}

	engine, ok := gh.gameManager.ActiveGames[moveData.GameID]
	if !ok {
		return
	}

	if err := engine.ProcessMove(c.GetUserID(), moveData.Payload); err != nil {
		log.Printf("Error: %v", err)
		return
	}

	var broadcastBytes []byte

	winner, winningLine := engine.GetWinner()
	isDraw := (winner == 0) && engine.IsFull()

	if winner != 0 || isDraw {
		broadcast := map[string]interface{}{
			"type":         "game_finished",
			"status":       "FINISH",
			"game_id":      moveData.GameID,
			"winner":       winner,
			"winning_line": winningLine,
			"state":        engine.GetState(),
		}
		broadcastBytes, err = json.Marshal(broadcast)
		if err != nil {
			log.Printf("Error al serializar broadcast: %v", err)
			return
		}
	} else {
		broadcast := map[string]interface{}{
			"type":    "game_update",
			"status":  "PLAY",
			"game_id": moveData.GameID,
			"state":   engine.GetState(),
		}
		broadcastBytes, err = json.Marshal(broadcast)
		if err != nil {
			log.Printf("Error al serializar broadcast: %v", err)
			return
		}
	}

	var roomID64 uint
	_, err = fmt.Sscanf(moveData.GameID, "%d", &roomID64)
	if err != nil {
		log.Printf("Error al convertir GameID %s a uint: %v", moveData.GameID, err)
		return
	}
	roomID := uint(roomID64)

	gh.hub.BroadcastToRoom(roomID, broadcastBytes)
}
