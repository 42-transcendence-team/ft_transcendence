package routes

import (
	"backend/internal/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func TodoRoutes(r *gin.Engine, db *gorm.DB) {
	//todoHandler := handlers.NewTodoHandler(db)

	userGroup := r.Group("/todos")
	{
		userGroup.POST("", controllers.TodoCreate(db))
	}
}
