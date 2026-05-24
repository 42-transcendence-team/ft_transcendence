// PostRoutes registra los endpoints relacionados con publicaciones.
// Este archivo solo conecta rutas HTTP con sus handlers;
// la lógica de negocio vive en services y el acceso a datos en repository.

package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func PostRoutes(api *gin.RouterGroup, postHandler *handlers.PostHandler) {
	posts := api.Group("/posts")
	{
		// Crea un post con texto, imagen o ambos.
		posts.POST("", postHandler.CreatePost)

		// Obtiene un post concreto por ID.
		posts.GET("/:id", postHandler.GetPostByID)
	}
}
