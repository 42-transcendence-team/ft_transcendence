package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// Midelware para bloquear acceso a rutas login y register a los usuarios autenticados

func RejectIfAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		strToken, err := c.Cookie("jwt")
		if err == nil {
			_, err := utils.ValidateToken(strToken, cfg)
			if err == nil {
				c.Error(appErr.NewConflict("user already authenticated"))
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
