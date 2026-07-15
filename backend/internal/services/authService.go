package services

import (
	"backend/config"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/store"
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

func (s *AuthService) Register(input dto.RegisterInput) (user models.User, err error) {

	err = IsValidAge(input.Birthday)
	if err != nil {
		return models.User{}, err
	}

	if !utils.IsStrongPassword(input.Password) {
		return models.User{}, appErr.NewValidation(map[string]string{
			"password": "weak_password",
		})
	}

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

func NewUser(input dto.RegisterInput) models.User {
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

func (s *AuthService) Login(input dto.LoginInput) (dto.LoginResult, error) {

	user, err := s.userRepo.FindByLoginOrEmail(input.Identifier)
	if err != nil {
		return dto.LoginResult{}, appErr.NewUnauthorized("invalid credentials")
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return dto.LoginResult{}, appErr.NewUnauthorized("invalid credentials")
	}

	// Crea un Token temporal en el caso de que el suaurio tenga 2FA activo para poder validar el codigo TOTP en el siguiente paso del login
	if user.Active2FA {
		tempToken, err := utils.CreateTempJwtToken()
		if err != nil {
			return dto.LoginResult{}, appErr.NewInternal(err)
		}

		store.GlobalTempStore.Set(tempToken, store.TempTokenData{
			UserID: user.ID,
			Expiry: time.Now().Add(time.Duration(s.cfg.Expiration2FA) * time.Second), // ahora mismo dura 5min el temporal para pruebas, luego se puede ajustar
			// se podria añadir un contador de intentos para eliminar el token despues de X intentos fallidos
			// Intentos: 0,
			// MaxIntentos: 5,
			// Esto se puede usar para evitar ataques de fuerza bruta al endpoint de validacion 2FA
			// Quizá tambien controlar las peticiones con el mismo correo/login para evitar ataques de fuerza bruta al login normal
		})

		return dto.LoginResult{
			User:        user,
			TempToken:   tempToken,
			Requires2FA: true,
			ExpTime:     time.Now().Add(time.Duration(s.cfg.Expiration2FA) * time.Second),
		}, nil
	}

	strToken, expTime, err := utils.CreateJwtToken(user, s.cfg)
	if err != nil {
		return dto.LoginResult{}, err
	}

	return dto.LoginResult{
		Token:       strToken,
		TempToken:   "",
		User:        user,
		ExpTime:     expTime,
		Requires2FA: false,
	}, nil
}

func (s *AuthService) GetUserById(userID uint) (*models.User, error) {

	user, err := s.userRepo.FindById(userID)
	if err != nil {
		return nil, appErr.NewUnauthorized("invalid user")
	}

	return user, err
}
