package services

import (
	"backend/config"
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/store"
	"backend/internal/utils"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"gorm.io/gorm"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	cfg       *config.Config
	tempStore *store.TempStore
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		cfg:       cfg,
		tempStore: store.NewTempStore(),
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

func (s *UserService) GetUserByLogin(login string) (*models.User, error) {
	user, err := s.UserRepo.FindByLoginOrEmail(login)
	if err != nil {
		return nil, appErr.NewUnauthorized("user_not_found")
	}
	return user, nil
}

func (s *AuthService) Build42AuthURL() string {
	return fmt.Sprintf(
		"https://api.intra.42.fr/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code",
		url.QueryEscape(s.cfg.OAuth42ClientID),
		url.QueryEscape(s.cfg.OAuth42RedirectURI),
	)
}

func (s *AuthService) Exchange42Code(code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", s.cfg.OAuth42ClientID)
	data.Set("client_secret", s.cfg.OAuth42ClientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", s.cfg.OAuth42RedirectURI)

	resp, err := http.PostForm("https://api.intra.42.fr/oauth/token", data)
	if err != nil {
		return "", appErr.NewInternal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest {
		return "", appErr.NewBadRequest("invalid oauth code")
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return "", appErr.NewUnauthorized("invalid 42 client credentials")
	}

	if resp.StatusCode != http.StatusOK {
		return "", appErr.NewInternal(
			fmt.Errorf("42 oauth unexpected status: %d", resp.StatusCode),
		)
	}

	var token dto.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return "", appErr.NewInternal(err)
	}

	return token.AccessToken, nil
}

func (s *AuthService) Get42User(token string) (*dto.User42, error) {
	req, err := http.NewRequest("GET", "https://api.intra.42.fr/v2/me", nil)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, appErr.NewUnauthorized("invalid 42 access token")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, appErr.NewInternal(
			fmt.Errorf("42 token validation unexpected status: %d", resp.StatusCode),
		)
	}

	var user dto.User42
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return &user, nil
}

func (s *AuthService) Search42User(user42 *dto.User42) (*models.User, error) {
	user, err := s.userRepo.FindByOAuth(user42.ID42)
	if err == nil {
		return user, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, appErr.NewInternal(err)
	}

	return nil, nil
}

func (s *AuthService) PreRegister42User(user42 *dto.User42) ([]byte, error) {
	newUser := dto.User42{}
	_, err := s.userRepo.FindByLoginOrEmail(user42.Login)
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, appErr.NewInternal(err)
	}

	newUser.ID42 = user42.ID42
	newUser.Login = user42.Login
	newUser.Email = user42.Email
	newUser.Name = user42.Name
	newUser.Surname = user42.Surname

	jsonUser, err := json.Marshal(newUser)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return jsonUser, nil
}

// func (s *AuthService) Register42User(user42 *dto.Register42User) (*models.User, error) {

// }
