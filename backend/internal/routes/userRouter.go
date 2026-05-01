package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	UserGroup := api.Group("/users")
	{
		UserGroup.GET("/", userHandler.Filter)
		// cuando se borre el usuario tambien hay que borrar las tablas de relacciones entre usuarios
		// y peticiones pendientes , bloqueos
		UserGroup.DELETE("/", userHandler.Delete)
		UserGroup.PUT("/", userHandler.Modify)
	}
}
