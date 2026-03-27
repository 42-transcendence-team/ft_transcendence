package routes

import (
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func TwoFARoutesPrivate(api *gin.RouterGroup, twoFAHandler *handlers.TwoFAHandler) {
	UserGroup := api.Group("/2fa")
	{
		UserGroup.POST("/enable", twoFAHandler.Enable2FA)
		UserGroup.POST("/verify", twoFAHandler.Verify2FA)
		UserGroup.POST("/disable", twoFAHandler.Disable2FA)
	}
}
