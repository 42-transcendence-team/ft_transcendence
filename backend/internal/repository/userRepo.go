package repository

import (
	"backend/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

/* func (r *UserRepository) GetByEmail(user *models.User) {
	r.db.Where("email = ?", email).First(&user)
}

func GetByLogin(login string) {

}
*/

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}
