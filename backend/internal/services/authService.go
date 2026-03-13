package services

import (
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"strconv"
	"time"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

type RegisterInput struct {
	Login    string
	Email    string
	Password string
	Name     string
	Surname  string
	Birtday  time.Time
}

func (s *AuthService) Register(input RegisterInput) (user models.User, err error) {

	if !IsStrongPassword(input.Password) {
		return models.User{}, appErr.NewValidation(map[string]string{
			"password": "weak_password",
		})
	}

	// https://gowebexamples.com/password-hashing/
	// no se si es demasiado simple
	input.Password, err = hashPassword(input.Password)
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
		Birthday: input.Birtday,
	}
}

// esto lo pille de ahi -> https://gowebexamples.com/password-hashing/
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func IsStrongPassword(password string) bool {

	var hasUpper bool
	var hasLower bool
	var hasNumber bool
	var hasSymbol bool

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

type LoginInput struct {
	Identifier string
	Password   string
}

type CustomClaims struct {
	jwt.RegisteredClaims
}

const TokenTTL = 24 * time.Hour // el token dura 24 horas
// const TokenTTL = 60 * time.Second // si quieres que el token dure x segundos para probarlo

func (s *AuthService) Login(input LoginInput) (string, *models.User, error) {

	user, err := s.userRepo.FindByLoginOrEmail(input.Identifier)
	if err != nil {
		return "", nil, appErr.NewUnauthorized("invalid credentials")
	}

	if !CheckPasswordHash(input.Password, user.Password) {
		return "", nil, appErr.NewUnauthorized("invalid credentials")
	}

	strToken, err := createJwtToken(user)
	if err != nil {
		return "", nil, err
	}

	return strToken, user, err
}

func createJwtToken(user *models.User) (string, error) {

	exp := time.Now().Add(TokenTTL)

	claims := CustomClaims{
		jwt.RegisteredClaims{
			Subject:   strconv.Itoa(int(user.ID)),     // "sub" quien es el dueño del token
			ExpiresAt: jwt.NewNumericDate(exp),        // "exp" cuando deja el token de ser valido
			IssuedAt:  jwt.NewNumericDate(time.Now()), // "iat" cuando se creo el token
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	strToken, err := token.SignedString([]byte("JWt-secret-hay-q-importarlo"))
	if err != nil {
		return "", appErr.NewInternal(err)
	}

	return strToken, err
}
