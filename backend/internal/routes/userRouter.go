package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	UserGroup := api.Group("/users")
	{
		UserGroup.GET("/", userHandler.Filter)
		UserGroup.GET("/settings", userHandler.GetSettings)
		UserGroup.DELETE("/delete", userHandler.RemoveAccount)
		UserGroup.PUT("/update", userHandler.ModifyAccount)
	}
}
