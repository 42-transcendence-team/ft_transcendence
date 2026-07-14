package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func ChatRoutes(api *gin.RouterGroup, chatHandler *handlers.ChatHandler) {
	chatGroup := api.Group("/chat")
	{
		chatGroup.PUT("/enter", chatHandler.UpdateLastTimeOpenedChat)
		chatGroup.GET("/unread/:roomId", chatHandler.GetMessages)
	}
}
