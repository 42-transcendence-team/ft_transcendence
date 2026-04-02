package utils

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"strconv"
	"time"
)

type CustomClaims struct {
	Id uint `json:"id"`
	jwt.RegisteredClaims
}

func CreateJwtToken(user *models.User, cfg *config.Config) (string, time.Time, error) {

	exp := time.Now().Add(time.Duration(cfg.JwtExpirationTime) * time.Second)

	claims := CustomClaims{
		user.ID,
		jwt.RegisteredClaims{
			Subject:   strconv.Itoa(int(user.ID)),     // "sub" quien es el dueño del token
			ExpiresAt: jwt.NewNumericDate(exp),        // "exp" cuando deja el token de ser valido
			IssuedAt:  jwt.NewNumericDate(time.Now()), // "iat" cuando se creo el token
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	strToken, err := token.SignedString([]byte(cfg.JwtSecret))
	if err != nil {
		return "", time.Time{}, appErr.NewInternal(err)
	}

	return strToken, exp, err
}

func ValidateToken(strToken string, cfg *config.Config) (*CustomClaims, error) {

	token, err := jwt.ParseWithClaims(strToken, &CustomClaims{},
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

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, appErr.NewUnauthorized("invalid token")
	}

	return claims, nil
}
