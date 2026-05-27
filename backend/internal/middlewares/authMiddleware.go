package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/utils"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

/*
Para el front -> si recibe un eror unautroized redirigir la peticion al login
*/

func AuthMiddleware(cfg *config.Config, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		strToken, err := c.Cookie("jwt")
		if err != nil {
			c.Error(appErr.NewUnauthorized("missing auth token"))
			c.Abort()
			return
		}

		log.Printf("AuthMiddleware: Received request with JWT token: %s", strToken)
		claims, err := utils.ValidateToken(strToken, cfg)
		if err != nil {
			c.Error(err)
			c.Abort()
			return
		}

		log.Printf("AuthMiddleware: Validated JWT token for user ID %d", claims.Id)

		ctx := c.Request.Context()
		sessionKey := fmt.Sprintf("session:%d", claims.Id)
		log.Printf("AuthMiddleware: Checking Redis for session key: %s", sessionKey)

		storedToken, err := rdb.Get(ctx, sessionKey).Result()
		if err == redis.Nil || storedToken != strToken {
			c.Error(appErr.NewUnauthorized("session expired or logged out"))
			c.Abort()
			return
		}
		log.Printf("AuthMiddleware: Session valid for user ID %d", claims.Id)

		c.Set("userID", claims.Id) // guarda dentro del contexto el usuario que hace la peticion
		/*
			Si el usuario es validado por que el token esta bien pasa al siguiente paso (ya sea midelware o el handler de la ruta) , para en estaa request si quieres saber el id del
			propietario se usara ->
			algo asi userID es una unidad uint como el la db , asik podremos acceder facilmente a los datos
			userID := c.MustGet("userID").(uint)
			// (uint) para cambiar el tipo de variable de any a uint
		*/

		c.Next()
	}
}
