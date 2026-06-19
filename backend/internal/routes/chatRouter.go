package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func ChatRoutes(api *gin.RouterGroup, chatHandler *handlers.ChatHandler) {
	chatGroup := api.Group("/chat")
	{
		chatGroup.GET("/ws", chatHandler.HandleWebSocket)
		chatGroup.GET("/me", chatHandler.GetMe)
		chatGroup.POST("/rooms", chatHandler.CreateRoom)
		chatGroup.GET("/rooms", chatHandler.ListRooms)
		chatGroup.PUT("/enter", chatHandler.UpdateLastTimeOpenedChat)
		chatGroup.GET("/unread/:roomId", chatHandler.GetMessages)
		// chatGroup.GET("/rooms/:id/messages", chatHandler.GetRoomMessages)
	}
}
