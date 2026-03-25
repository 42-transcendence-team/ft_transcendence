package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func TwoFARoutes(api *gin.RouterGroup, twoFAHandler *handlers.TwoFAHandler) {
	UserGroup := api.Group("/2fa")
	{
		UserGroup.POST("/enable", twoFAHandler.Enable2FA)
		UserGroup.POST("/verify", twoFAHandler.Verify2FA)
		UserGroup.POST("/disable", twoFAHandler.Disable2FA)
		UserGroup.POST("/login", twoFAHandler.Login2FA) // No se si es necesario o va por Auth
	}
}
