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
		UserGroup.POST("/password", userHandler.UpdatePassword)
		UserGroup.POST("/email", userHandler.UpdateEmail)
		UserGroup.POST("/data", userHandler.UpdatePersonalData)
		UserGroup.GET("/", userHandler.Filter)
		//UserGroup.DELETE("/", userHandler.Delete)
		//UserGroup.PUT("/", userHandler.Modify)
		UserGroup.GET("/me", userHandler.GetMe)
	}
}
