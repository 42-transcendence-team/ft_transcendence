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

	// cuando tu mandas un usuario o un email duplicados el indice como que aumuenta pero no se guarda en al db por la flag
	// `gorm:"uniqueIndex"` y el siguiente usuario se guarda con un indice mas nose si es el funcionamiento de gorm y asi esta bien.
	// si intentas crear 1000 usuarios duplicados aunk no se guarden cuando crees uno q no sea duplicado se guardara como 1001
	user = NewUser(imput.Login, imput.Email, imput.Password)
	err = s.userRepo.Create(&user)
	if err != nil {
		// como llegan los errores de la base de datos???
		// los errores se estionan en el handler
		fmt.Printf(err.Error())
	}
	return user, err
}

func NewUser(login string, email string, password string) models.User {
	return models.User{
		Login:    login,
		Email:    &email,
		Password: password,
	}
}
