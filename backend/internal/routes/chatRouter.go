package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func ChatRoutes(api *gin.RouterGroup, chatHandler *handlers.ChatHandler) {
	wsGroup := api.Group("/ws")
	{
		// Este grupo necesita un middleware ficticio que comprueba que tengas la cookie de authorizacion para poder llamar al grupo de endpoint de /ws
		// wsGroup.Use(middlewares.AuthRequired()) 
		wsGroup.GET("/room", chatHandler.CreateConver)
		wsGroup.GET("/dm/:userID", chatHandler.CreateRoom)
	}
}
