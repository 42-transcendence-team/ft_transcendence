package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/services"
	"backend/internal/utils"
	ws "backend/internal/websocket"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebsocketHandler struct {
	hub              *ws.Hub
	websocketService *services.WebsocketService
}

func NewWebsocketHandler(hub *ws.Hub, websocketService *services.WebsocketService) *WebsocketHandler {
	return &WebsocketHandler{hub: hub, websocketService: websocketService}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *WebsocketHandler) HandleWebSocket(ctx *gin.Context) {
	userIDValue, exists := ctx.Get("userID")
	if !exists {
		ctx.Error(appErr.NewUnauthorized("Unauthorized user"))
		ctx.Abort()
		return
	}

	user, err := h.websocketService.GetUser(userIDValue.(uint))
	if err != nil {
		ctx.Error(appErr.NewInternal(errors.New("invalid userID type in context")))
		ctx.Abort()
		return
	}

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	log.Printf("err %v", err)
	if err != nil {
		ctx.Error(appErr.NewInternal(errors.New("failed to upgrade to websocket")))
		ctx.Abort()
		return
	}

	client := ws.NewClient(conn, h.hub, user.ID, user.Login)

	h.hub.Register <- client

	go client.ReadPump(h.HandleMessage)
	go client.WritePump()
}

func (h *WebsocketHandler) GetMe(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID"))
		c.Abort()
		return
	}

	user, err := h.websocketService.GetUser(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *WebsocketHandler) CreateRoom(c *gin.Context) {
	//a lo mejor aqui hay que comprobar que son amigos
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	_, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID"))
		c.Abort()
		return
	}

	var req dto.CreateRoomRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Printf("Error binding JSON: %v", req)
		c.Error(appErr.NewBadRequest("Invalid request body"))
		c.Abort()
		return
	}
	
	if (req.Users[0] != userIDValue.(uint)){//hacer que si se envia un payload con mas user verificar cada uno for
		req.Users = append(req.Users, userIDValue.(uint))
	}

	room, err := h.websocketService.CreateRoom(&req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	payload, perr := json.Marshal(dto.RoomPayload{
		RoomID: room.ID,
	})
	if perr != nil {
		c.Error(err)
		c.Abort()
		return
	}
	message, merr := json.Marshal(dto.NotificationMessage{
		Type:    "CREATE_ROOM",
		Payload: payload,
	})
	if merr != nil {
		c.Error(err)
		c.Abort()
		return
	}
	h.hub.SendMessagesToUsers(req.Users, message)
	c.JSON(http.StatusOK, room)
}

func (h *WebsocketHandler) ListRooms(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	id, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID"))
		c.Abort()
		return
	}

	rooms, err := h.websocketService.ListRooms(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, rooms)
}

func (h *WebsocketHandler) HandleMessage(c ws.ClientConn, msg *dto.IncomingMessage) {
	switch msg.Type {
	case "join_room":
		h.JoinRoom(c, msg)
	case "leave_room":
		h.LeaveRoom(c, msg)
	case "message":
		h.SendMessage(c, msg)
	case "destroy":
		h.Destroy(c, msg)
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

func (h *WebsocketHandler) JoinRoom(c ws.ClientConn, msg *dto.IncomingMessage) {
	h.hub.Mu.RLock()
	room, ok := h.hub.Rooms[msg.RoomID]
	h.hub.Mu.RUnlock()

	if !ok {
		dbRoom, err := h.websocketService.GetRoomByID(msg.RoomID)
		if err != nil {
			log.Printf("Error fetching room from database: %v", err)
			return
		}

		if dbRoom.ID == 0 {
			log.Printf(
				"Room with ID %d doesn't exist in database",
				msg.RoomID,
			)
			return
		}

		room = h.hub.CreateRoom(dbRoom.ID, dbRoom.Name, dbRoom.Private)
	}

	c.JoinRoom(room)

	msgs, err := h.websocketService.LoadRoomMessages(room.ID, c.GetUserID())
	if err != nil {
		log.Printf("Error loading room messages: %v", err)
		return
	}
	log.Printf("mensajes: %v", msgs)

	dtoMessages := make([]dto.Msg, len(msgs))

	index := 0
	for _, msg := range msgs {
		messageDTO := dto.Msg{
			MessageID: msg.ID,
			Username:  msg.Username,
			Content:   msg.Content,
			Timestamp: msg.Timestamp.In(utils.Madrid).Format(time.RFC3339),
		}
		dtoMessages[index] = messageDTO
		index++
	}
	resp := dto.Messages{
		RoomID: room.ID,
		Type:   "join",
		Msgs:   dtoMessages,
	}

	data, err := json.Marshal(resp)

	c.Send(data)
}

func (h *WebsocketHandler) LeaveRoom(c ws.ClientConn, msg *dto.IncomingMessage) {
	room, ok := h.hub.Rooms[msg.RoomID]
	if !ok {
		log.Printf("leave room Room with ID %d doesn't exists", msg.RoomID)
		return
	}
	c.LeaveRoom(room)
}

func (h *WebsocketHandler) Destroy(c ws.ClientConn, msg *dto.IncomingMessage) {
	room, ok := h.hub.Rooms[msg.RoomID]
	log.Printf("room: %v", room)
	if !ok {
		log.Printf(" destroy Room with ID %d doesn't exists", msg.RoomID)
		return
	}
	c.Destroy(room)
}

func (h *WebsocketHandler) SendMessage(c ws.ClientConn, msg *dto.IncomingMessage) {
	timestamp := time.Now().In(utils.Madrid)

	tmp_msg := &models.ChatMessage{
		RoomID:    msg.RoomID,
		UserID:    c.GetUserID(),
		Username:  c.GetUsername(),
		Content:   msg.Message,
		Timestamp: &timestamp,
	}
	errDB := h.websocketService.SaveMessage(tmp_msg)
	if errDB != nil {
		newErr := appErr.NewInternal(errors.New("failed to create message"))
		data, _ := json.Marshal(newErr)
		c.Send(data)
		return
	}
	message := dto.Message{
		MessageID: tmp_msg.ID,
		Type:      "message",
		RoomID:    msg.RoomID,
		UserID:    c.GetUserID(),
		Username:  c.GetUsername(),
		Content:   msg.Message,
		Timestamp: timestamp.Format("2006-01-02 15:04:05"),
	}

	log.Printf("mensage despues de meterlo en db %v", message)
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	if err := c.SendMessage(msg.RoomID, data); err != nil {
		log.Printf("Error sending message to room %d: %v", msg.RoomID, err)
	}
}
