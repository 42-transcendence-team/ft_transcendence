package server

import (
	"backend/internal/handlers"
	"backend/internal/middlewares"
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
	friendRepo := repository.NewFriendRepository(srv.Db)

	authService := services.NewAuthService(userRepo, srv.Conf)
	userService := services.NewUserService(userRepo)
	twoFAService := services.New2FAService(userRepo, authService)
	friendService := services.NewFriendRequestService(friendRepo, userRepo)
	blockService := services.NewBlockUserService(friendRepo, userRepo)

	authHandler := handlers.NewAuthHandler(authService, srv.Conf, srv.Redis)
	userHandler := handlers.NewUserHandler(userService, srv.Redis)
	twoFAHandler := handlers.New2FAHandler(twoFAService, authHandler)
	friendHandler := handlers.NewFriendHandler(friendService, blockService)

	api := srv.Engine.Group("/api/v1")

	// rutas publicas para usuarios no autenticados
	publicForNoAuth := api.Group("/")
	publicForNoAuth.Use(middlewares.RejectIfAuthMiddleware(srv.Conf))
	{
		routes.AuthRoutes(publicForNoAuth, authHandler)
	}

	// Esto en realidad no se como poder hacerlo bonito
	login := api.Group("/2fa")
	login.Use(middlewares.TwoFAMiddleware(srv.Conf))
	{
		login.POST("/login", twoFAHandler.Login2FA)
	}

	// rutas privadas
	protected := api.Group("/")
	protected.Use(middlewares.AuthMiddleware(srv.Conf, srv.Redis))
	{
		routes.TestRoute(protected)
		routes.AuthRoutesPrivate(protected, authHandler) //hacer que no se llame cuando el usuario no este autenticado
		routes.FriendsRoutes(protected, friendHandler)
		routes.TwoFARoutesPrivate(protected, twoFAHandler)
		routes.UserRoutes(protected, userHandler)
		// aqui irean todas las rutas que tienen que pasar por el middleware de auth
	}

	srv.Engine.NoMethod(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "method not allowed"})
	})
	srv.Engine.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})
}
