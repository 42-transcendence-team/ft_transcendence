package server

import (
	"backend/internal/handlers"
	"backend/internal/repository"
	routes "backend/internal/routes"
	"backend/internal/services"
	"github.com/gin-gonic/gin"
)

// El enroutador es una retaila de: Metodo -> ruta -> handler
// Para añadir un endpoint hay que confeccionar la funcion en internals/handlers y
// añadir el enpoint con un comantario encima describiendo lo que hace para el swagger
func (srv *HTTPServer) Router() {

	routes.HealthRoutes(srv.Engine)

	userRepo := repository.NewUserRepository(srv.Db)
	authService := services.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	// usaremos este grupo para definir las funciones del proyecto y aplicar middlewares comunes
	api := srv.Engine.Group("/api/v1")
	routes.AuthRoutes(api, authHandler)
	// ejemplo:
	// api.GET("/login", log42Aouth2)

	srv.Engine.NoMethod(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "method not allowed"})
	})
	srv.Engine.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})
}
