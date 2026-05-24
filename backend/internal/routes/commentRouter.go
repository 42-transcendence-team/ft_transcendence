package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func CommentRoutes(api *gin.RouterGroup, commentHandler *handlers.CommentHandler) {
	posts := api.Group("/posts")
	{
		// Lista los comentarios de un post.
		posts.GET("/:id/comments", commentHandler.ListCommentsByPostID)

		// Crea un comentario en un post.
		posts.POST("/:id/comments", commentHandler.CreateComment)
	}
}
