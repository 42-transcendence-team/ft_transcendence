package middlewares

import (
	"backend/config"
	//appErr "backend/internal/errors"
	"backend/internal/utils"
	"github.com/gin-gonic/gin"
)

func GetMeMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		strToken, err := c.Cookie("jwt")
		if err != nil {
			c.Next()
		}

		claims, err := utils.ValidateToken(strToken, cfg)
		if err != nil {
			c.Error(err)
			c.Abort()
			return
		}

		c.Set("userID", claims.Id) // guarda dentro del contexto el usuario que hace la peticion
		c.Set("login", claims.Login)
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
