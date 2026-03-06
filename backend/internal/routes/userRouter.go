package routes

import (
	"backend/internal/user"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(r *gin.Engine, db *gorm.DB) {
	UserGroup := r.Group("/users")
	{
		UserGroup.POST("", user.UserCreate(db))
		UserGroup.GET("/index", user.UserIndex(db))
		UserGroup.GET("/:id", user.UserShow(db))
		UserGroup.DELETE("/:id", user.UserDelete(db))
		UserGroup.PUT("/:id", user.UserUpdate(db))
	}
}
