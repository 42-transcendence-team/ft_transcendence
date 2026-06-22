package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostLikeRoutes(
	api *gin.RouterGroup,
	postLikeHandler *handlers.PostLikeHandler,
) {
	posts := api.Group("/posts")
	{
		// Crea un like o sustituye un dislike existente.
		posts.POST("/:id/likes", postLikeHandler.LikePost)

		// Elimina el like del usuario autenticado.
		posts.DELETE("/:id/likes", postLikeHandler.UnlikePost)

		// Crea un dislike o sustituye un like existente.
		posts.POST("/:id/dislikes", postLikeHandler.DislikePost)

		// Elimina el dislike del usuario autenticado.
		posts.DELETE("/:id/dislikes", postLikeHandler.UndislikePost)
	}
}
