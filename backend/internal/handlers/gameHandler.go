package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	ws "backend/internal/websocket"
	"encoding/json"
	"fmt"
	"log"
	"math/rand/v2"
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

func (gh *GameHandler) NewRoomId() uint {
	const min uint32 = 3_000_000_000
	const max uint32 = 4_294_967_295

	for {
		newID := uint(min + rand.Uint32N(max-min+1))

		if _, exists := gh.hub.GetRoom(newID); !exists {
			return newID
		}
	}
}

func (gh *GameHandler) HandleCreateGame(c ws.ClientConn, msg *dto.IncomingMessage) {
	var createData dto.CreateGame
	err := json.Unmarshal(msg.Payload, &createData)
	if err != nil {
		log.Printf("Error al decodificar CreateGame: %v", err)
		return
	}

	newGameID := gh.NewRoomId()

	err = gh.gameManager.CreateGame(newGameID, createData.GameType, createData.Mode)
	if err != nil {
		log.Printf("Error al crear el juego: %v", err)
		return
	}

	state := gh.gameManager.ActiveGames[newGameID].GetState()

	room := gh.hub.CreateRoom(newGameID, fmt.Sprintf("Game-%d", newGameID), false)

	c.JoinRoom(room)

	err = gh.gameManager.ActiveGames[newGameID].ConnectPlayer(c.GetUserID(), c.GetUsername())
	if err != nil {
		log.Printf("Error al unir al jugador: %v", err)
		return
	}

	response := map[string]interface{}{
		"type":   "game_created",
		"state":  state,
		"status": "",
	}

	if createData.Mode == "online" {
		response["status"] = "LOBBY"
	} else {
		response["status"] = "PLAY"
	}

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

	room := gh.hub.CreateRoom(joinData.GameID, fmt.Sprintf("Game-%d", joinData.GameID), false)

	c.JoinRoom(room)

	engine, ok := gh.gameManager.ActiveGames[joinData.GameID]
	if !ok {
		log.Printf("Error: Partida %d no existe en GameManager", joinData.GameID)
		return
	}

	err = engine.ConnectPlayer(c.GetUserID(), c.GetUsername())
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

	gh.hub.BroadcastToRoom(joinData.GameID, broadcastBytes)
}

func (gh *GameHandler) HandleLeaveGame(c ws.ClientConn, msg *dto.IncomingMessage) {
	var leaveData dto.LeaveGame
	err := json.Unmarshal(msg.Payload, &leaveData)
	if err != nil {
		log.Printf("Error al decodificar LeaveGame: %v", err)
		return
	}

	log.Printf("Usuario %d abandonó la partida %d", c.GetUserID(), leaveData.GameID)

	err = gh.gameManager.ActiveGames[leaveData.GameID].DisconnectPlayer(c.GetUserID())
	if err != nil {
		log.Printf("Error al abandonar la partida: %v", err)
		return
	}

	room, exists := gh.hub.GetRoom(leaveData.GameID)
	if !exists {
		log.Printf("Error: Sala %d no existe en Hub", leaveData.GameID)
		return
	}
	broadcast := map[string]interface{}{
		"type":  "game_update",
		"state": gh.gameManager.ActiveGames[leaveData.GameID].GetState(),
	}
	broadcastBytes, _ := json.Marshal(broadcast)

	gh.hub.BroadcastToRoom(leaveData.GameID, broadcastBytes)

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
	isDraw := (winner == 0) && engine.IsFinished() // TODO - Revisar como pasar Player i no winner como int

	if winner != 0 || isDraw {
		broadcast := map[string]interface{}{
			"type":         "game_finished",
			"status":       "FINISH",
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
			"type":   "game_update",
			"status": "PLAY",
			"state":  engine.GetState(),
		}
		broadcastBytes, err = json.Marshal(broadcast)
		if err != nil {
			log.Printf("Error al serializar broadcast: %v", err)
			return
		}
	}

	gh.hub.BroadcastToRoom(moveData.GameID, broadcastBytes)
}
