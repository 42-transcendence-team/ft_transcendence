package repository

import (
	"context"

	"backend/internal/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) DeleteUser(ctx context.Context, id uint) error {
	user := &models.User{}
	user.ID = id
	return r.db.WithContext(ctx).Delete(user).Error
}
