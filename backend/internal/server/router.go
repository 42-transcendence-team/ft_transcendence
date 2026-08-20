package server

import (
	"backend/internal/handlers"
	"backend/internal/middlewares"
	"backend/internal/repository"
	routes "backend/internal/routes"
	"backend/internal/services"
	"backend/internal/storage"
	"backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// El enroutador es una retaila de: Metodo -> ruta -> handler
// Para añadir un endpoint hay que confeccionar la funcion en internals/handlers y
// añadir el enpoint con un comantario encima describiendo lo que hace para el swagger
func (srv *HTTPServer) Router() {
	routes.HealthRoutes(srv.Engine)
	srv.Engine.GET("/metrics", gin.WrapH(promhttp.Handler()))

	hub := websocket.NewHub()
	go hub.Run()

	srv.Engine.MaxMultipartMemory = 8 << 20 // 8 MB
	srv.Engine.Static("/uploads", "./uploads")

	userRepo := repository.NewUserRepository(srv.Db)
	chatRepo := repository.NewChatRepository(srv.Db)
	friendRepo := repository.NewFriendRepository(srv.Db)
	postRepo := repository.NewPostRepository(srv.Db)
	commentRepo := repository.NewCommentRepository(srv.Db)
	websocketRepo := repository.NewWebsocketRepository(srv.Db)
	postLikeRepo := repository.NewPostLikeRepository(srv.Db)
	notifRepo := repository.NewNotificationRepository(srv.Db)

	imageStorage := storage.NewImageStorage("uploads")

	authService := services.NewAuthService(userRepo, srv.Conf)
	userService := services.NewUserService(userRepo)
	websocketService := services.NewWebsocketService(websocketRepo, userRepo, friendRepo)
	chatService := services.NewChatService(chatRepo, userRepo)
	twoFAService := services.New2FAService(userRepo, authService, srv.Redis)
	friendService := services.NewFriendRequestService(friendRepo, userRepo)
	advancedSearchService := services.NewAdvancedSearch(userRepo, friendRepo)
	blockService := services.NewBlockUserService(friendRepo, userRepo)
	postService := services.NewPostService(postRepo, postLikeRepo)
	commentService := services.NewCommentService(commentRepo, postRepo)
	postLikeService := services.NewPostLikeService(postRepo, postLikeRepo)
	notificationService := services.NewNotificationService(notifRepo, hub)

	authHandler := handlers.NewAuthHandler(authService, srv.Conf, srv.Redis)
	userHandler := handlers.NewUserHandler(
		userService,
		srv.Redis,
		imageStorage,
		advancedSearchService,
	)
	twoFAHandler := handlers.New2FAHandler(twoFAService, authHandler)
	websocketHandler := handlers.NewWebsocketHandler(hub, websocketService)
	chatHandler := handlers.NewChatHandler(hub, chatService)
	postHandler := handlers.NewPostHandler(friendService, hub, postService, imageStorage, notificationService)
	commentHandler := handlers.NewCommentHandler(hub, commentService, notificationService)
	postLikeHandler := handlers.NewPostLikeHandler(hub, postLikeService, notificationService)
	friendHandler := handlers.NewFriendHandler(friendService, blockService, hub, websocketService)
	getMeHandler := handlers.NewGetMeHandler(authService, srv.Conf)
	notificationsHandler := handlers.NewNotificationsHandler(friendService, websocketService, chatService, notificationService)

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
		routes.WebsocketRoutes(protected, websocketHandler)
		routes.ChatRoutes(protected, chatHandler)
		routes.UserRoutes(protected, userHandler)
		routes.NotificationRoutes(protected, notificationsHandler)
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
