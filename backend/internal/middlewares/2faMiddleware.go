package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// Es para verificar el Token temporal que se genera al hacer login en el caso de que el usuario tenga 2FA activo
// Permite acceder al endpoint de validacion del codigo TOTP
func TwoFAMiddleware(cfg *config.Config, redis *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		tempToken, err := c.Cookie("tempToken")
		if err != nil {
			c.Error(appErr.NewUnauthorized("missing auth token"))
			c.Abort()
			return
		}

		data, err := redis.Get(c, "2fa_token:"+tempToken).Result()
		if err != nil {
			c.Error(appErr.NewUnauthorized("invalid or expired temp token"))
			c.Abort()
			return
		}

		id, err := strconv.Atoi(data)
		if err != nil {
			c.Error(appErr.NewUnauthorized("invalid user id in temp token"))
			c.Abort()
			return
		}

		c.Set("userID", uint(id))
		c.Next()
	}
}
