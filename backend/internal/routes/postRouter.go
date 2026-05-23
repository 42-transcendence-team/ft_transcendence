package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostRoutes(api *gin.RouterGroup, postHandler *handlers.PostHandler) {
	posts := api.Group("/posts")
	{
		// Crea un post solo con texto.
		posts.POST("", postHandler.CreateTextPost)

		// Obtiene un post concreto por ID.
		posts.GET("/:id", postHandler.GetPostByID)
	}
}
