package utils

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	Id    uint   `json:"id"`
	Login string `json:"login"`
	jwt.RegisteredClaims
}

func CreateJwtToken(user *models.User, cfg *config.Config) (string, time.Time, error) {

	exp := time.Now().Add(time.Duration(cfg.JwtExpirationTime) * time.Second)

	claims := CustomClaims{
		Id:               user.ID,
		Login:            user.Login,
		RegisteredClaims: jwt.RegisteredClaims{
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

func CreateTempJwtToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}

func ValidateToken(strToken string, cfg *config.Config) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(
		strToken,
		&CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, appErr.NewUnauthorized("invalid signing method")
			}
			return []byte(cfg.JwtSecret), nil
		},
	)

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
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
