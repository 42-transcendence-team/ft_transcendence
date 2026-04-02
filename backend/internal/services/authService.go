package services

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"time"
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

type RegisterInput struct {
	Login    string
	Email    string
	Password string
	Name     string
	Surname  string
	Birthday time.Time
}

func (s *AuthService) Register(input RegisterInput) (user models.User, err error) {

	err = IsValidAge(input.Birthday)
	if err != nil {
		return models.User{}, err
	}

	if !utils.IsStrongPassword(input.Password) {
		return models.User{}, appErr.NewValidation(map[string]string{
			"password": "weak_password",
		})
	}

	// https://gowebexamples.com/password-hashing/
	// no se si es demasiado simple
	input.Password, err = utils.HashPassword(input.Password)
	if err != nil {
		return models.User{}, appErr.NewInternal(err)
	}

	user = NewUser(input)
	err = s.userRepo.Create(&user)
	if err != nil {
		if s.userRepo.IsDuplicatedKey(err) {
			// esto detecta que el login o el email ya existen no hay dispincion de si es una cosa o la otra
			return models.User{}, appErr.NewConflict("user_already_exists")
		}
		return models.User{}, appErr.NewInternal(err)
	}

	return user, nil
}

func NewUser(input RegisterInput) models.User {
	return models.User{
		Login:    input.Login,
		Email:    &input.Email,
		Password: input.Password,
		Name:     input.Name,
		Surname:  input.Surname,
		Birthday: input.Birthday,
	}
}

func IsValidAge(birthday time.Time) error {
	// fecha_nacimiento <= (hoy - 18 años)
	today := time.Now()
	oldestAllowed := today.AddDate(-150, 0, 0)  // maxima edad permitida 150 años
	youngestAllowed := today.AddDate(-18, 0, 0) // minima edad permitida 18 años

	if birthday.After(youngestAllowed) {
		return appErr.NewValidation(map[string]string{
			"birthday": "your age must be +18",
		})
	}
	if birthday.Before(oldestAllowed) {
		return appErr.NewValidation(map[string]string{
			"birthday": "your age must be -150 years",
		})
	}
	return nil
}

type LoginInput struct {
	Identifier string
	Password   string
}

func (s *AuthService) Login(input LoginInput) (string, *models.User, time.Time, error) {

	user, err := s.userRepo.FindByLoginOrEmail(input.Identifier)
	if err != nil {
		return "", nil, time.Time{}, appErr.NewUnauthorized("invalid credentials")
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return "", nil, time.Time{}, appErr.NewUnauthorized("invalid credentials")
	}

	strToken, expTime, err := utils.CreateJwtToken(user, s.cfg)
	if err != nil {
		return "", nil, time.Time{}, err
	}

	return strToken, user, expTime, err
}

func (s *AuthService) GetUserById(userID uint) (*models.User, error) {

	user, err := s.userRepo.FindById(userID)
	if err != nil {
		return nil, appErr.NewUnauthorized("invalid user")
	}

	return user, err
}
