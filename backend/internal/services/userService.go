package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/pquerna/otp/totp"
)

var validate = validator.New()

type UserService struct {
	UserRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{UserRepo: userRepo}
}

func (s *UserService) GetSettings(userID uint) (*dto.UserResponse, error) {
	return s.UserRepo.GetUserData(userID)
}

func (s *UserService) require2FA(user *models.User, code *string) error {
	if !user.Active2FA {
		return nil
	}

	if code == nil || *code == "" {
		return appErr.NewValidation(map[string]string{
			"code": "2fa_required",
		})
	}

	return s.Validate2FA(user.ID, *code)
}

func (s *UserService) Validate2FA(userID uint, code string) error {
	passcode := strings.TrimSpace(code)

	secret, err := s.UserRepo.Get2FASecret(userID)
	if err != nil {
		return err
	}

	if !totp.Validate(passcode, secret) {
		return appErr.NewValidation(map[string]string{
			"error": "invalid_2fa_code",
		})
	}

	return nil
}

func (s *UserService) RemoveAccount(request dto.UserDelete) error {
	req, err := s.UserRepo.FindById(request.Id)
	if err != nil {
		return err
	}
	if err := s.require2FA(req, request.Code); err != nil {
		return err
	}
	currentPassword, err := s.UserRepo.GetPassword(request.Id)
	if err != nil {
		return err
	}
	if !utils.CheckPasswordHash(request.Password, currentPassword) {
		return appErr.NewUnauthorized("Invalid password")
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

func (s *UserService) ModifyPass(userID uint, request dto.ModifyInputPass) error {
	req, err := s.UserRepo.FindById(userID)
	if err != nil {
		return err
	}
	if err := s.require2FA(req, request.Code); err != nil {
		return err
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

	currentPassword, err := s.UserRepo.GetPassword(userID)
	if err != nil {
		return err
	}

	if !utils.CheckPasswordHash(request.PreviousPassword, currentPassword) {
		return appErr.NewUnauthorized("Invalid previous password")
	}

	if utils.CheckPasswordHash(request.Password, currentPassword) {
		return appErr.NewValidation(map[string]string{
			"password": "new_password_must_be_different",
		})
	}

	hashedPassword, err := utils.HashPassword(request.Password)
	if err != nil {
		return appErr.NewInternal(err)
	}

	request.Password = hashedPassword

	rows, err := s.UserRepo.UpdateUserPassword(userID, request)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}

	return nil
}

func isValidEmail(email string) bool {
	return validate.Var(email, "required,email") == nil
}

func (s *UserService) ModifyEmail(userID uint, request dto.ModifyInputEmail) error {
	req, err := s.UserRepo.FindById(userID)
	if err != nil {
		return err
	}
	if err := s.require2FA(req, request.Code); err != nil {
		return err
	}

	if request.VerifyEmail != request.Email {
		return appErr.NewValidation(map[string]string{
			"verify_email": "emails_do_not_match",
		})
	}
	if req.Email != nil && request.Email == *req.Email {
		return appErr.NewValidation(map[string]string{
			"email": "new_email_must_be_different",
		})
	}

	if !isValidEmail(request.Email) || !isValidEmail(request.VerifyEmail) {
		return appErr.NewValidation(map[string]string{
			"error": "invalid_email_format",
		})
	}

	rows, err := s.UserRepo.UpdateUserEmail(userID, request)
	if err != nil {
		return err
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}

	return nil
}

func (s *UserService) ModifyData(userID uint, request dto.ModifyInputData) error {
	req, err := s.UserRepo.FindById(userID)
	if err != nil {
		return err
	}
	if err := s.require2FA(req, request.Code); err != nil {
		return err
	}

	if request.Name != nil {
		if *request.Name == req.Name {
			return appErr.NewValidation(map[string]string{
				"name": "new_name_must_be_different",
			})
		}
		if len(*request.Name) > 50 {
			return appErr.NewValidation(map[string]string{
				"name": "name_too_long",
			})
		}
	}

	if request.Surname != nil {
		if *request.Surname == req.Surname {
			return appErr.NewValidation(map[string]string{
				"surname": "new_surname_must_be_different",
			})
		}
		if len(*request.Surname) > 50 {
			return appErr.NewValidation(map[string]string{
				"surname": "surname_too_long",
			})
		}
	}

	if request.Birthday != nil {
		if request.Birthday.Equal(req.Birthday) {
			return appErr.NewValidation(map[string]string{
				"birthday": "new_birthday_must_be_different",
			})
		}
		if request.Birthday.After(time.Now()) {
			return appErr.NewValidation(map[string]string{
				"birthday": "birthday_cannot_be_in_future",
			})
		}
		if utils.CalculateAge(*request.Birthday) < 18 {
			return appErr.NewValidation(map[string]string{
				"birthday": "user_must_be_at_least_18_years_old",
			})
		}
		if utils.CalculateAge(*request.Birthday) > 120 {
			return appErr.NewValidation(map[string]string{
				"birthday": "user_age_unrealistic",
			})
		}
	}

	rows, err := s.UserRepo.UpdateUserData(userID, request)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}

	return nil
}

func (s *UserService) GetUserByID(userID uint) (*models.User, error) {
	user, err := s.UserRepo.FindById(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
