package routes

import (
	"backend/internal/handlers"
	chat "backend/internal/services"

	"github.com/gin-gonic/gin"
)

func chatRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	wsGroup := api.Group("/ws")
	{
		// Este grupo necesita un middleware ficticio que comprueba que tengas la cookie de authorizacion para poder llamar al grupo de endpoint de /ws
		// wsGroup.Use(middlewares.AuthRequired()) 
		wsGroup.GET("/", chat.ServeWS(hub, Db))
	}
}
