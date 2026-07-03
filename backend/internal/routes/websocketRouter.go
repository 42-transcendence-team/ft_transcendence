package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func WebsocketRoutes(api *gin.RouterGroup, websocketHandler *handlers.WebsocketHandler) {
	websocketGroup := api.Group("/chat")
	{
		websocketGroup.GET("/ws", websocketHandler.HandleWebSocket)
		websocketGroup.GET("/me", websocketHandler.GetMe)
		websocketGroup.POST("/rooms", websocketHandler.CreateRoom)
		websocketGroup.GET("/rooms", websocketHandler.ListRooms)
	}
}
