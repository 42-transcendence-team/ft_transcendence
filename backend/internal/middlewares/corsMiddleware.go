package middlewares

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS(allowedURLs []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cors.New(cors.Config{
			AllowOrigins:     allowedURLs,
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Content-Length", "Accept-Encoding"},
			AllowCredentials: true,
		})(c)
		c.Next()
	}
}
