package services

import (
	"backend/internal/models"
	"backend/internal/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetAll(users *[]models.User) error {
	return s.userRepo.GetAll(users)
}
