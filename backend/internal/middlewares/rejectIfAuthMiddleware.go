package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"github.com/gin-gonic/gin"
)

func RejectIfAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		strToken, err := c.Cookie("jwt")
		if err == nil {
			_, err := ValidateToken(strToken, cfg)
			if err == nil {
				c.Error(appErr.NewConflict("already authenticate"))
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
