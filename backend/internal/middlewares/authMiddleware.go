package middlewares

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

/*
Para el front -> si recibe un eror unautroized redirigir la peticion al login
*/

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		strToken, err := c.Cookie("jwt")
		if err != nil {
			c.Error(appErr.NewUnauthorized("missing auth token"))
			c.Abort()
			return
		}

		claims, err := ValidateToken(strToken, cfg)
		if err != nil {
			c.Error(err)
			c.Abort()
			return
		}

		c.Set("userID", claims.Id) // guarda dentro del contexto el usuario que hace la peticion
		/*
			Si el usuario es validado por que el token esta bien pasa al siguiente paso (ya sea midelware o el handler de la ruta) , para en estaa request si quieres saber el id del
			propietario se usara ->
			algo asi userID es una unidad uint como el la db , asik podremos acceder facilmente a los datos
			userIDValue, exists := c.Get("userID")
			if !exists {
				// es que no hay userID en el contexto, creo q nunca deberia de no haber si lelgo hasta ahi pero puede ser bueno chekearlo
			}
		*/

		c.Next()
	}
}

func ValidateToken(strToken string, cfg *config.Config) (*services.CustomClaims, error) {

	token, err := jwt.ParseWithClaims(strToken, &services.CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, appErr.NewUnauthorized("invalid signing method")
			}
			return []byte(cfg.JwtSecret), nil
		})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			// si expira el token nunca llegara aqui por que la cokie directamente se borra, lo dejo por seguridad
			return nil, appErr.NewUnauthorized("expired token")
		}
		if errors.Is(err, jwt.ErrTokenSignatureInvalid) {
			return nil, appErr.NewUnauthorized("invalid signature")
		}
		return nil, appErr.NewUnauthorized("invalid token")
	}

	claims, ok := token.Claims.(*services.CustomClaims)
	if !ok || !token.Valid {
		return nil, appErr.NewUnauthorized("invalid token")
	}

	return claims, nil
}
