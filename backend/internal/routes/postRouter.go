// PostRoutes registra los endpoints relacionados con publicaciones.
// Este archivo solo conecta rutas HTTP con sus handlers;
// la lógica de negocio vive en services y el acceso a datos en repository.

package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostRoutes(
	api *gin.RouterGroup,
	postHandler *handlers.PostHandler,
	commentHandler *handlers.CommentHandler,
	postLikeHandler *handlers.PostLikeHandler,
) {
	posts := api.Group("/posts")
	{
		// Crea un post con texto, imagen o ambos.
		posts.POST("", postHandler.CreatePost)

		post := posts.Group("/:id")
		{
			// Obtiene un post concreto por ID.
			post.GET("", postHandler.GetPostByID)

			// Borra un post propio.
			post.DELETE("", postHandler.DeletePost)

			postComments := post.Group("/comments")
			{
				// Lista los comentarios de un post.
				postComments.GET("", commentHandler.ListCommentsByPostID)

				// Crea un comentario en un post.
				postComments.POST("", commentHandler.CreateComment)
			}

			likes := post.Group("/likes")
			{
				// Crea un like o sustituye un dislike existente.
				likes.POST("", postLikeHandler.LikePost)

				// Elimina el like del usuario autenticado.
				likes.DELETE("", postLikeHandler.UnlikePost)
			}

			dislikes := post.Group("/dislikes")
			{
				// Crea un dislike o sustituye un like existente.
				dislikes.POST("", postLikeHandler.DislikePost)

				// Elimina el dislike del usuario autenticado.
				dislikes.DELETE("", postLikeHandler.UndislikePost)
			}
		}
	}

	comments := api.Group("/comments")
	{
		// Borra un comentario propio.
		comments.DELETE("/:id", commentHandler.DeleteComment)
	}
}
