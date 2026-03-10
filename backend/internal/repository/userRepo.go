package repository

import (
	"backend/internal/models"
	"errors"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) IsDuplicatedKey(err error) bool {
	return errors.Is(err, gorm.ErrDuplicatedKey)
}

func (r *UserRepository) FindByLoginOrEmail(identifier string) (*models.User, error) {

	var user models.User

	err := r.db.Where("email = ? OR login = ?", identifier, identifier).First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, err
}
