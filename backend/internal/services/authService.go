package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"fmt"
	"github.com/gin-gonic/gin"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

type RegisterImput struct {
	Login    string
	Email    string
	Password string
}

func (s *AuthService) Register(c *gin.Context, imput RegisterImput) (user models.User, err error) {

	user = NewUser(imput.Login, imput.Email)
	err = s.userRepo.Create(&user)
	/*if err != nil {
		// como llegan los errores de la base de datos???
		// los errores se estionan en el handler
	}*/
	fmt.Printf(err.Error())
	return user, err
}

func NewUser(login string, email string) models.User {
	return models.User{
		Login: login,
		Email: &email,
	}
}
