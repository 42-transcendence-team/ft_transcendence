package handlers

import (
	"backend/internal/chat"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	ChatService *services.ChatService
	Hub         *chat.Hub
}

func NewChatHandler(chatService *services.ChatService, hub *chat.Hub) *ChatHandler {
	return &ChatHandler{ChatService: chatService, Hub: hub}
}

func (h *ChatHandler) SendMsg(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	chat.ServeWs(h.Hub, c.Writer, c.Request)
	_ = userID
}

func (h *ChatHandler) CreateRoom(c *gin.Context) {}
func (h *ChatHandler) CreateConver(c *gin.Context) {}

