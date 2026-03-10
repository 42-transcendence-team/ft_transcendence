package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(api *gin.RouterGroup, userHandler *handlers.UserHandler) {
	UserGroup := api.Group("/users")
	{
		UserGroup.GET("/", userHandler.GetAll)
		// UserGroup.GET("/:id")
		// UserGroup.DELETE("/:id")
		//UserGroup.PUT("/:id", userHandler.Upload)
	}
}
