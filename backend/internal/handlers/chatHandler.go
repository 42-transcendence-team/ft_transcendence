package handlers

import (
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	ChatService *services.ChatService
}

func (h *ChatHandler) CreateRoom(c *gin.Context) {
	// 1. validar los datos

	// 2. LLamar al servicio
	// h.ChatService.CreateRoom()

	// 3. devolver un json
	// c.JSON(http.StatusOK, /*struct*/)
}

func (h *ChatHandler) CreateConver(c *gin.Context) {
	// 1. validar los datos

	// 2. LLamar al servicio
	// h.ChatService.CreateConver()

	// 3. devolver un json
	// c.JSON(http.StatusOK, /*struct*/)
}

func (h *ChatHandler) SendMsg(c *gin.Context) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil { return }

    userID := 1; /* leerlo de la cookie */
    client := &hub.Client{UserID: userID, Conn: conn, Send: make(chan []byte, 256)}
    h.Hub.Register <- client

    go client.WritePump()
    go client.ReadPump(h.Hub)
}
