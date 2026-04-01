package server

import (
	"backend/internal/chat"
	"backend/internal/handlers"
	"backend/internal/middlewares"
	"backend/internal/repository"
	"backend/internal/routes"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

// El enroutador es una retaila de: Metodo -> ruta -> handler
// Para añadir un endpoint hay que confeccionar la funcion en internals/handlers y
// añadir el enpoint con un comantario encima describiendo lo que hace para el swagger
// internal/server/router.go

func (srv *HTTPServer) Router() {

	routes.HealthRoutes(srv.Engine)

	userRepo := repository.NewUserRepository(srv.Db)
	chatRepo := repository.NewChatRepository(srv.Db)

	authService := services.NewAuthService(userRepo, srv.Conf)
	userService := services.NewUserService(userRepo)
	chatService := services.NewChatService(chatRepo)

	authHandler := handlers.NewAuthHandler(authService, srv.Conf)
	userHandler := handlers.NewUserHandler(userService)

	hub := chat.NewHub()
	go hub.Run()

	chatHandler := handlers.NewChatHandler(chatService, hub)

	api := srv.Engine.Group("/api/v1")

	routes.AuthRoutes(api, authHandler)
	routes.UserRoutes(api, userHandler)

	protected := api.Group("/")
	protected.Use(middlewares.AuthMiddleware(srv.Conf))
	{
		routes.TestRoute(protected)
		routes.AuthRoutesPrivate(protected, authHandler)
		routes.ChatRoutes(protected, chatHandler)
	}

	srv.Engine.NoMethod(func(c *gin.Context) { c.JSON(404, gin.H{"error": "method not allowed"}) })
	srv.Engine.NoRoute(func(c *gin.Context) { c.JSON(404, gin.H{"error": "route not found"}) })
}
