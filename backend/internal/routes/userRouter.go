package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	UserGroup := api.Group("/users")
	{
		UserGroup.GET("/settings", userHandler.GetSettings)
		UserGroup.DELETE("/delete", userHandler.RemoveAccount)
		UserGroup.POST("/update-password", userHandler.UpdatePassword)
		UserGroup.POST("/update-email", userHandler.UpdateEmail)
		UserGroup.POST("/update-user", userHandler.UpdatePersonalData)
	}
}
