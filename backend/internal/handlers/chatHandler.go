package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/services"
	"backend/internal/utils"
	ws "backend/internal/websocket"
	"strconv"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	hub         *ws.Hub
	chatService *services.ChatService
}

func NewChatHandler(hub *ws.Hub, chatService *services.ChatService) *ChatHandler {
	return &ChatHandler{hub: hub, chatService: chatService}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *ChatHandler) HandleWebSocket(ctx *gin.Context) {
	userIDValue, exists := ctx.Get("userID")
	if !exists {
		ctx.Error(appErr.NewUnauthorized("Unauthorized user"))
		ctx.Abort()
		return
	}

	user, err := h.chatService.GetUser(userIDValue.(uint))
	if err != nil {
		ctx.Error(appErr.NewInternal(errors.New("invalid userID type in context")))
		ctx.Abort()
		return
	}

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
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

func (h *ChatHandler) GetMe(c *gin.Context) {
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

	user, err := h.chatService.GetUser(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *ChatHandler) CreateRoom(c *gin.Context) {
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
	log.Printf("request: %v", c.Request.Body)

	var req dto.CreateRoomRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Printf("Error binding JSON: %v", req)
		c.Error(appErr.NewBadRequest("Invalid request body"))
		c.Abort()
		return
	}
	req.Users = append(req.Users, userIDValue.(uint))

	room, err := h.chatService.CreateRoom(&req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	h.hub.CreateRoom(room.ID, room.Name, room.Private)
	m, _:= json.Marshal(dto.NotificationMessage{
		Type : "notification",
		Content : "You have been added to a new chat room",
	})
	h.hub.SendNotificationToUsers(req.Users, m)
	c.JSON(http.StatusOK, room)
}

func (h *ChatHandler) ListRooms(c *gin.Context) {
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

	rooms, err := h.chatService.ListRooms(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, rooms)
}

func (h *ChatHandler) HandleMessage(c ws.ClientConn, msg *dto.IncomingMessage) {
	switch msg.Type {
		case "join_room":
			h.JoinRoom(c, msg)
		case "leave_room":
			h.LeaveRoom(c, msg)
		case "message":
			h.SendMessage(c, msg)
		default:
			log.Printf("Unknown message type: %s", msg.Type)
	}
}

func (h *ChatHandler) JoinRoom(c ws.ClientConn, msg *dto.IncomingMessage) {
	h.hub.Mu.RLock()
	room, ok := h.hub.Rooms[msg.RoomID]
	h.hub.Mu.RUnlock()

	if !ok {
		dbRoom, err := h.chatService.GetRoomByID(msg.RoomID)
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

	msgs, err := h.chatService.LoadRoomMessages(room.ID, c.GetUserID())
	if err != nil {
		log.Printf("Error loading room messages: %v", err)
		return
	}

	//log.Printf("messages: %v", msgs)
	
	dtoMessages := make([]dto.Msg, len(msgs))

	index := 0;
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
		Type: "join",
		Msgs: dtoMessages,
	}

	data, err := json.Marshal(resp)
	
	c.Send(data)
}

func (h *ChatHandler) LeaveRoom(c ws.ClientConn, msg *dto.IncomingMessage) {
	room, ok := h.hub.Rooms[msg.RoomID]
	if !ok {
		log.Printf("Room with ID %d doesn't exists", msg.RoomID)
		return
	}
	c.LeaveRoom(room)
}

func (h *ChatHandler) SendMessage(c ws.ClientConn, msg *dto.IncomingMessage) {
	timestamp := time.Now().In(utils.Madrid)

	tmp_msg :=  &models.ChatMessage{
		RoomID:    msg.RoomID,
		UserID:    c.GetUserID(),
		Username:  c.GetUsername(),
		Content:   msg.Message,
		Timestamp: &timestamp,
	}
	errDB := h.chatService.SaveMessage(tmp_msg)
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

type UpdateLastTimeOpenedChatRequest struct {
	RoomID uint `json:"room_id" binding:"required"`
}
//func (h *ChatHandler) HandleWebSocket(ctx *gin.Context)
func (h *ChatHandler) UpdateLastTimeOpenedChat(c *gin.Context) {
	var req UpdateLastTimeOpenedChatRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	userID := c.MustGet("userID").(uint)
	erro := h.chatService.UpdateLastTimeOpenChat(userID, req.RoomID)
	if (erro != nil) {
		c.Error(err)
		c.Abort()
		return
	}
	log.Printf("hola si funciona el chat ")
	log.Printf("get opened: %d %d", userID, req)
	c.JSON(200, gin.H{})
}

func (h *ChatHandler) GetMessages(c *gin.Context) {

	paramStr := c.Param("roomId")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil {
		c.Error(appErr.NewBadRequest("Invalid request"))
		c.Abort()
		return
	}

	roomId := uint(id64)
	userID := c.MustGet("userID").(uint)
	
	req := h.chatService.GetMessageNotRead(roomId, userID)
	
	log.Printf("get messages: %d %d", roomId, userID)

	c.JSON(200, gin.H{"messages_count": req})
}
