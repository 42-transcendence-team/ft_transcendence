package routes

import (
	"backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(api *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	// puede que haya mas errores aun me queda por pulir alguno
	// Registra un usuario (user-created-> 201, o bad-request-> 400, o no-valid-request-> 422, o conflict-> 409) en formato JSON
	api.POST("auth/register", authHandler.Register)
	api.POST("auth/login", authHandler.Login)

}
