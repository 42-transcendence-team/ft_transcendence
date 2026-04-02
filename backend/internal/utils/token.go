package utils

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"crypto/rand"
	"encoding/hex"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
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

func CreateTempJwtToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}
