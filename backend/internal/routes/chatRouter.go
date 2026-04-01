package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func ChatRoutes(api *gin.RouterGroup, chatHandler *handlers.ChatHandler) {
	wsGroup := api.Group("/chat")
	{
		wsGroup.GET("/ws", chatHandler.SendMsg)
		// Este grupo necesita un middleware ficticio que comprueba que tengas la cookie de authorizacion para poder llamar al grupo de endpoint de /ws
		// wsGroup.Use(middlewares.AuthRequired()) 
		
		// Ruta para crear una Sala
		wsGroup.POST("/room", chatHandler.CreateRoom)
		
		// Ruta para crear un DM (para el futuro)
		wsGroup.POST("/dm", chatHandler.CreateConver)	}
}
