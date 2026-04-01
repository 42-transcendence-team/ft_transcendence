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

// SendMsg es el único punto de entrada para WebSockets
// es en payload donde se distingue la conversacion específica
func (h *ChatHandler) SendMsg(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	chat.ServeWs(h.Hub, c.Writer, c.Request, userID, h.ChatService)
}

func (h *ChatHandler) CreateRoom(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "El nombre de la sala es obligatorio"})
		return
	}
	room, err := h.ChatService.CreateRoom(req.Name)
	if err != nil {
		c.JSON(500, gin.H{"error": "No se pudo crear la sala", "details": err.Error()})
		return
	}

	c.JSON(201, room)
}

// Handler para crear un DM (Conversación privada)
func (h *ChatHandler) CreateConver(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req struct {
		TargetUserID uint `json:"target_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "El ID del usuario destino es obligatorio"})
		return
	}

	conv, err := h.ChatService.CreateConversation(userID, req.TargetUserID)
	if err != nil {
		c.JSON(500, gin.H{"error": "No se pudo crear la conversación", "details": err.Error()})
		return
	}

	c.JSON(201, conv)
}
