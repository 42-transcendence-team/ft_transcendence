package handlers

import (
	"log"
	appErr "backend/internal/errors"
	"backend/internal/services"
	ws "backend/internal/websocket"
	"strconv"
	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	hub         *ws.Hub
	chatService *services.ChatService
}

func NewChatHandler(hub *ws.Hub, chatService *services.ChatService) *ChatHandler {
	return &ChatHandler{hub: hub, chatService: chatService}
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
