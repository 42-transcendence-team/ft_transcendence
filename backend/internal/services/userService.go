package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"strings"

	"github.com/pquerna/otp/totp"
)

type UserService struct {
	UserRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{UserRepo: userRepo}
}

func (s *UserService) Filter(filter dto.UserFilter) ([]models.User, error) {
	// Faltan todas las validaciones de filtrado, como accesos permitidos y denegados o tamaños maximos de input...
	// Tambien, dependiendo de lo anterior, que datos/objeto se devuelve (Admin: todos, User: login, email, surname, ...)
	// De momento funciona en cualquier caso y devuelve todo segun ausencia o no de filtros
	return s.UserRepo.Filter(filter)
}

func (s *UserService) GetSettings(request dto.UserResponse) (*dto.UserResponse, error) {
	return s.UserRepo.GetUserData(request.Id)
}

func (s *UserService) RemoveAccount(request dto.UserDelete) error {
	req, err := s.UserRepo.FindById(request.Id)
	if err != nil {
		return err
	}
	if req.Active2FA {
		passcode := strings.TrimSpace(request.Code)
		secret, err := s.UserRepo.Get2FASecret(request.Id)
		if err != nil {
			return err
		}
		valid := totp.Validate(passcode, secret)
		if !valid {
			return appErr.NewUnauthorized("Invalid 2FA code")
		}
	}

	rows, err := s.UserRepo.Delete(request)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}
	return nil
}

func (s *UserService) ModifyAccount(userID uint, request dto.ModifyInput) error {
	req, err := s.UserRepo.FindById(userID)
	if err != nil {
		return err
	}
	if req.Active2FA {
		passcode := strings.TrimSpace(request.Code)
		secret, err := s.UserRepo.Get2FASecret(userID)
		if err != nil {
			return err
		}
		valid := totp.Validate(passcode, secret)
		if !valid {
			return appErr.NewUnauthorized("Invalid 2FA code")
		}
	}

	if request.Password != "" {
		if request.PreviousPassword == "" {
			return appErr.NewValidation(map[string]string{
				"previous_password": "previous_password_required",
			})
		}
		currentPassword, err := s.UserRepo.GetPassword(userID)
		if err != nil {
			return err
		}
		if !utils.CheckPasswordHash(request.PreviousPassword, currentPassword) {
			return appErr.NewUnauthorized("Invalid previous password")
		}
		if currentPassword == request.Password {
			return appErr.NewValidation(map[string]string{
				"password": "new_password_must_be_different",
			})
		}
		if request.VerifyPassword == "" {
			return appErr.NewValidation(map[string]string{
				"verify_password": "verify_password_required",
			})
		}
		if request.VerifyPassword != request.Password {
			return appErr.NewValidation(map[string]string{
				"verify_password": "passwords_do_not_match",
			})
		}
		if !utils.IsStrongPassword(request.Password) {
			return appErr.NewValidation(map[string]string{
				"password": "weak_password",
			})
		}
		hashedPassword, err := utils.HashPassword(request.Password)
		if err != nil {
			return appErr.NewInternal(err)
		}
		request.Password = hashedPassword
	}

	if request.Email != "" {
		if request.VerifyEmail == "" {
			return appErr.NewValidation(map[string]string{
				"verify_email": "verify_email_required",
			})
		}
		if request.VerifyEmail != request.Email {
			return appErr.NewValidation(map[string]string{
				"verify_email": "emails_do_not_match",
			})
		}
		if request.Email == *req.Email {
			return appErr.NewValidation(map[string]string{
				"email": "new_email_must_be_different",
			})
		}
	}

	if request.Name != "" {
		if request.Name == req.Name {
			return appErr.NewValidation(map[string]string{
				"name": "new_name_must_be_different",
			})
		}
		if len(request.Name) > 50 {
			return appErr.NewValidation(map[string]string{
				"name": "name_too_long",
			})
		}
	}

	if request.Surname != "" {
		if request.Surname == req.Surname {
			return appErr.NewValidation(map[string]string{
				"surname": "new_surname_must_be_different",
			})
		}
		if len(request.Surname) > 50 {
			return appErr.NewValidation(map[string]string{
				"surname": "surname_too_long",
			})
		}
	}

	rows, err := s.UserRepo.UpdateUser(userID, request)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}

	return nil
}
