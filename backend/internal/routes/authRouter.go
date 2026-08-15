package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(api *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	// Registra un usuario (user-created-> 201, o bad-request-> 400, o no-valid-request-> 422, o conflict-> 409) en formato JSON
	api.POST("auth/register", authHandler.Register)
	// Login de usuario validando credenciales (user-login-> 200, o bad-request-> 400, o no-valid-request-> 422, o unauthorized-> 401) en formato JSON
	api.POST("auth/login", authHandler.Login)

	api.GET("auth/42/login", authHandler.Login42)
	api.GET("auth/42/callback", authHandler.Login42Callback)
	api.GET("auth/42/userInfo", authHandler.Get42UserInfo)
	api.POST("auth/42/register", authHandler.Register42)
}

func AuthRoutesPrivate(api *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	// Dice al front quien es el usuario authenticado (user-authenticate-> 200, unauthorized-> 401, internal-> 500) en formato JSON
	// Logout de usuario (user-logout-> 200) en formato JSON
	api.POST("auth/logout", authHandler.Logout)
}
