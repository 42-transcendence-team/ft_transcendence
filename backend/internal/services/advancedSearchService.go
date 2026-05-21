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

type AdvancedSearchService struct {
	UserRepo *repository.UserRepository
}

func NewAdvancedSearch(userRepo *repository.UserRepository) *AdvancedSearchService {
	return &AdvancedSearchService{UserRepo: userRepo}
}

func (s *AdvancedSearchService) SearchUsers(userID uint, query dto.UserFilter) (dto.UserSearch, error) {
	/*
		validar page/limit
		validar sort
		llamar al repo para buscar usuarios
		calcular relation con cada usuario
		calcular can_send_request
		devolver respuesta
	*/
	/*	si es friend -> can_send_request false
		si pending_sent -> false
		si pending_received -> false
		si blocked_by_me -> false
		si blocked_me -> false
		si none -> true
	*/
}
