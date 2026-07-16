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

// TODO - Seperar los casos del switch a funciones individuales, quitar logueos en futuro

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

	switch actionEnvelope.Action {

	case "create":
		var createData dto.CreateGame
		err := json.Unmarshal(msg.Payload, &createData)
		if err != nil {
			log.Printf("Error al decodificar CreateGame: %v", err)
			return
		}

		newGameID := fmt.Sprintf("%d", time.Now().Unix())

		gh.gameManager.CreateGame(newGameID, createData.GameType)

		log.Printf("Partida %s creada", newGameID)

		data := map[string]interface{}{
			"game_id":   newGameID,
			"game_type": createData.GameType,
		}

		response := map[string]interface{}{
			"type":    "game_created",
			"payload": data,
		}
		responseBytes, _ := json.Marshal(response)
		c.Send(responseBytes)

	case "make_move":
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
		if winner != 0 {
			broadcast := map[string]interface{}{
				"type":         "game_finished",
				"winner":       winner,
				"winning_line": winningLine,
			}
			broadcastBytes, err = json.Marshal(broadcast)
			if err != nil {
				log.Printf("Error al serializar broadcast: %v", err)
				return
			}
		} else {
			broadcast := map[string]interface{}{
				"type":  "game_update",
				"state": engine.GetState(),
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

	case "join":
		var joinData dto.JoinGame
		if err := json.Unmarshal(msg.Payload, &joinData); err != nil {
			log.Printf("Error al decodificar JoinGame: %v", err)
			return
		}

		log.Printf("Usuario %d se unió a la partida %s", c.GetUserID(), joinData.GameID)

		var roomID64 uint
		_, err := fmt.Sscanf(joinData.GameID, "%d", &roomID64)
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

		broadcast := map[string]interface{}{
			"type":  "game_update",
			"state": engine.GetState(),
		}
		broadcastBytes, _ := json.Marshal(broadcast)

		gh.hub.BroadcastToRoom(roomID, broadcastBytes)

	case "leave":
		var leaveData dto.LeaveGame
		err := json.Unmarshal(msg.Payload, &leaveData)
		if err != nil {
			log.Printf("Error al decodificar LeaveGame: %v", err)
			return
		}

		log.Printf("Usuario %d abandonó la partida %s", c.GetUserID(), leaveData.GameID)
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
		c.LeaveRoom(room)
	}
}
