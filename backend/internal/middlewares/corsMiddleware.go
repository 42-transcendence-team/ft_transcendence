package middlewares

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:3000"}, // Se cambiaria al dominio donde se aloje el front en produccion y cualquier otro dominio que necesitase la API
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Content-Length", "Accept-Encoding"},
			AllowCredentials: true,
		})(c)
		c.Next()
	}
}
