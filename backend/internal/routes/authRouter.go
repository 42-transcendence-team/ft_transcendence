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
	// TODO - Esto creo que no deberia ir aqui
	// Logout de usuario (user-logout-> 200) en formato JSON
	// api.POST("auth/logout", authHandler.Logout)

}

func AuthRoutesPrivate(api *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	// Dice al front quien es el usuario authenticado (user-authenticate-> 200, unauthorized-> 401, internal-> 500) en formato JSON
	api.GET("auth/me", authHandler.Whoami)
	// Logout de usuario (user-logout-> 200) en formato JSON
	api.POST("auth/logout", authHandler.Logout)
}
