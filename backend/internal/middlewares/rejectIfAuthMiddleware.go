package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/utils"
	"github.com/gin-gonic/gin"
)

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
