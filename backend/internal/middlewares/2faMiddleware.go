package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/store"

	"github.com/gin-gonic/gin"
)

// Es para verificar el Token temporal que se genera al hacer login en el caso de que el usuario tenga 2FA activo
// Permite acceder al endpoint de validacion del codigo TOTP
func TwoFAMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tempToken, err := c.Cookie("tempToken")
		if err != nil {
			c.Error(appErr.NewUnauthorized("missing auth token"))
			c.Abort()
			return
		}

		// TODO - Quitar GlobalTempStore y usar Redis para token temporal 2FA
		data, ok := store.GlobalTempStore.Get(tempToken)
		if !ok {
			c.Error(appErr.NewUnauthorized("invalid or expired temp token"))
			c.Abort()
			return
		}

		c.Set("userID", data.UserID)
		c.Next()
	}
}
