package services

import (
	"backend/config"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

type RegisterInput struct {
	Login    string
	Email    string
	Password string
	Name     string
	Surname  string
	Birtday  time.Time
}

type LoginInput struct {
	Identifier string
	Password   string
}

func (s *AuthService) Register(input RegisterInput) (user models.User, err error) {
	if !IsStrongPassword(input.Password) {
		return models.User{}, appErr.NewValidation(map[string]string{
			"password": "weak_password",
		})
	}
	input.Password, err = hashPassword(input.Password)
	if err != nil {
		return models.User{}, appErr.NewInternal(err)
	}
	user = NewUser(input)
	err = s.userRepo.Create(&user)
	if err != nil {
		if s.userRepo.IsDuplicatedKey(err) {
			return models.User{}, appErr.NewConflict("user_already_exists")
		}
		return models.User{}, appErr.NewInternal(err)
	}
	return user, nil
}

func (s *AuthService) Login(input LoginInput) (string, *models.User, time.Time, error) {
	user, err := s.userRepo.FindByLoginOrEmail(input.Identifier)
	if err != nil {
		return "", nil, time.Time{}, appErr.NewUnauthorized("invalid_credentials")
	}
	if !s.CheckPasswordHash(input.Password, user.Password) {
		return "", nil, time.Time{}, appErr.NewUnauthorized("invalid_credentials")
	}
	token, exp, err := utils.CreateJwtToken(user, s.cfg)
	if err != nil {
		return "", nil, time.Time{}, err
	}
	return token, user, exp, nil
}

func (s *AuthService) GetUserById(id uint) (*models.User, error) {
	user, err := s.userRepo.FindById(id)
	if err != nil {
		return nil, appErr.NewNotFound("user_not_found")
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
		Birthday: input.Birtday,
	}
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func IsStrongPassword(password string) bool {
	var hasUpper, hasLower, hasNumber, hasSymbol bool
	for _, c := range password {
		switch {
		case 'A' <= c && c <= 'Z':
			hasUpper = true
		case 'a' <= c && c <= 'z':
			hasLower = true
		case '0' <= c && c <= '9':
			hasNumber = true
		default:
			hasSymbol = true
		}
	}
	return hasUpper && hasLower && hasNumber && hasSymbol
}
