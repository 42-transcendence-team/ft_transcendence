package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ruta de prueba para ver si funciona el midelware de autentificacion
/*
primero teneis que hacer un register:

http://localhost:8080/api/v1/auth/register
{
  "login": "23360prueba",
  "email": "23360prueba@test.com",
  "password": "angelaewrw11%T",
  "confirmPassword": "angelaewrw11%T",
  "name": "ddd",
  "Surname": "barrio",
  "birthday": "2000-10-12"
}

luego un login:

http://localhost:8080/api/v1/auth/login
{
	"identifier": "23360prueba",
	"password":	"angelaewrw11%T"
}

y luego un test:
http://localhost:8080/api/v1/test
para que salga OK


si haces http://localhost:8080/api/v1/test sin login ni registro (sin la cokie generada)
te tiene que dar unautorized -> "missing auth token"

si cambiais en el .env JWT_EXPIRATION=10 a 10 s veries que el token solo dura 10s entoces habra expirado y
el front tendra q hacer login otra vez
*/

func TestRoute(incomingRoutes *gin.RouterGroup) {
	incomingRoutes.GET("/test", func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "user id not found in context",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "auth ok",
			"userID":  userID,
		})
	})
}
