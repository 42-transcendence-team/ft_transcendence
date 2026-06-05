package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostLikeRoutes(api *gin.RouterGroup, postLikeHandler *handlers.PostLikeHandler) {
	posts := api.Group("/posts")
	{
		posts.POST("/:id/likes", postLikeHandler.LikePost)
		posts.DELETE("/:id/likes", postLikeHandler.UnlikePost)
	}
}
