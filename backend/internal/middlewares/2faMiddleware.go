package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/store"

	"github.com/gin-gonic/gin"
)

func TwoFAMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tempToken, err := c.Cookie("tempToken")
		if err != nil {
			c.Error(appErr.NewUnauthorized("missing auth token"))
			c.Abort()
			return
		}

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
