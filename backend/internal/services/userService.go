package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) Filter(filter dto.UserFilter) ([]models.User, error) {
	// Faltan todas las validaciones de filtrado, como accesos permitidos y denegados o tamaños maximos de input...
	// Tambien, dependiendo de lo anterior, que datos/objeto se devuelve (Admin: todos, User: login, email, surname, ...)
	// De momento funciona en cualquier caso y devuelve todo segun ausencia o no de filtros
	return s.userRepo.Filter(filter)
}

func (s *UserService) Delete(filter dto.UserDelete) error {
	// Faltan todas las validaciones de eliminación, como accesos permitidos y denegados
	// De momento funciona en cualquier caso y elimina el usuario segun su id
	if filter.Id <= 0 {
		return appErr.NewValidation(map[string]string{
			"id": "id_required",
		})
	}
	rows, err := s.userRepo.Delete(filter)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}
	return nil
}

func (s *UserService) Modify(filter dto.UserModify) error {
	// Faltan todas las validaciones como en la funcion Delete o Filter
	if filter.Id <= 0 {
		return appErr.NewValidation(map[string]string{
			"id": "id_required",
		})
	}
	rows, err := s.userRepo.Modify(filter)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if rows == 0 {
		return appErr.NewNotFound("user_not_found")
	}
	return nil
}
