package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	UserGroup := api.Group("/users")
	{
		UserGroup.GET("/", userHandler.Filter)
		UserGroup.DELETE("/", userHandler.Delete)
		UserGroup.PUT("/", userHandler.Modify)
		UserGroup.GET("/me", userHandler.GetMe)
	}
}
