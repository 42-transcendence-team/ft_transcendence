package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostRoutes(api *gin.RouterGroup, postHandler *handlers.PostHandler) {
	posts := api.Group("/posts")
	{
		posts.GET("", postHandler.ListPosts)
		posts.POST("", postHandler.CreatePost)
		posts.GET("/:postId", postHandler.GetPostByID)
		posts.DELETE("/:postId", postHandler.DeletePost)

		posts.GET("/:postId/comments", postHandler.ListComments)
		posts.POST("/:postId/comments", postHandler.CreateComment)
	}
}
