package server

import (
	"backend/internal/handlers"
	"backend/internal/middlewares"
	"backend/internal/repository"
	routes "backend/internal/routes"
	"backend/internal/services"
	"backend/internal/storage"

	"github.com/gin-gonic/gin"
)

// El enroutador es una retaila de: Metodo -> ruta -> handler
// Para añadir un endpoint hay que confeccionar la funcion en internals/handlers y
// añadir el enpoint con un comantario encima describiendo lo que hace para el swagger
func (srv *HTTPServer) Router() {
	routes.HealthRoutes(srv.Engine)

	srv.Engine.MaxMultipartMemory = 8 << 20 // 8 MB
	srv.Engine.Static("/uploads", "./uploads")

	userRepo := repository.NewUserRepository(srv.Db)
	friendRepo := repository.NewFriendRepository(srv.Db)
	postRepo := repository.NewPostRepository(srv.Db)
	commentRepo := repository.NewCommentRepository(srv.Db)
	postLikeRepo := repository.NewPostLikeRepository(srv.Db)

	imageStorage := storage.NewImageStorage("uploads")

	authService := services.NewAuthService(userRepo, srv.Conf)
	userService := services.NewUserService(userRepo)
	twoFAService := services.New2FAService(userRepo, authService, srv.Redis)
	friendService := services.NewFriendRequestService(friendRepo, userRepo)
	blockService := services.NewBlockUserService(friendRepo, userRepo)
	postService := services.NewPostService(postRepo, postLikeRepo)
	commentService := services.NewCommentService(commentRepo, postRepo)
	postLikeService := services.NewPostLikeService(postRepo, postLikeRepo)

	authHandler := handlers.NewAuthHandler(authService, srv.Conf, srv.Redis)
	userHandler := handlers.NewUserHandler(userService, srv.Redis)
	twoFAHandler := handlers.New2FAHandler(twoFAService, authHandler)
	friendHandler := handlers.NewFriendHandler(friendService, blockService)
	postHandler := handlers.NewPostHandler(postService, imageStorage)
	commentHandler := handlers.NewCommentHandler(commentService)
	postLikeHandler := handlers.NewPostLikeHandler(postLikeService)
	getMeHandler := handlers.NewGetMeHandler(authService, srv.Conf)

	api := srv.Engine.Group("/api/v1")

	getMe := api.Group("/auth")
	getMe.Use(middlewares.GetMeMiddleware(srv.Conf))
	{
		getMe.GET("/me", getMeHandler.Whoami)
	}

	// rutas publicas para usuarios no autenticados
	publicForNoAuth := api.Group("/")
	publicForNoAuth.Use(middlewares.RejectIfAuthMiddleware(srv.Conf))
	{
		routes.AuthRoutes(publicForNoAuth, authHandler)
	}

	// Esto en realidad no se como poder hacerlo bonito
	login := api.Group("/2fa")
	login.Use(middlewares.TwoFAMiddleware(srv.Conf, srv.Redis))
	{
		login.POST("/login", twoFAHandler.Login2FA)
	}

	// rutas privadas
	protected := api.Group("/")
	protected.Use(middlewares.AuthMiddleware(srv.Conf, srv.Redis))
	{
		routes.TestRoute(protected)
		routes.AuthRoutesPrivate(protected, authHandler)
		routes.FriendsRoutes(protected, friendHandler)
		routes.TwoFARoutesPrivate(protected, twoFAHandler)
		routes.UserRoutes(protected, userHandler)
		routes.PostRoutes(
			protected,
			postHandler,
			commentHandler,
			postLikeHandler,
		)
		// aqui irean todas las rutas que tienen que pasar por el middleware de auth
	}

	srv.Engine.NoMethod(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "method not allowed"})
	})
	srv.Engine.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})
}
