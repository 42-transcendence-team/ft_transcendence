package repository

import (
	"backend/internal/db"
	"backend/internal/dto"
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

func (r *UserRepository) Filter(filter dto.UserFilter) ([]models.User, error) {
	var users []models.User
	query := r.db.Model(&models.User{})

	if filter.Login != "" {
		query = query.Where("login LIKE ?", "%"+filter.Login+"%")
	}
	if filter.Email != "" {
		query = query.Where("email LIKE ?", "%"+filter.Email+"%")
	}
	// Con Name y Surname tengo la duda de como se va a pasar desde el front, un solo input (?)
	if filter.Name != "" {
		query = query.Where("name LIKE ?", "%"+filter.Name+"%")
	}
	if filter.Surname != "" {
		query = query.Where("surname LIKE ?", "%"+filter.Surname+"%")
	}
	// Aqui el rol cambiará, ya que no se si sera un select o asi en frontend por lo que no sera necesario el Like
	if filter.Role != "" {
		query = query.Where("role LIKE ?", "%"+filter.Role+"%")
	}

	err := query.Scopes(db.Paginate(filter.Page, filter.Limit)).Find(&users).Error
	return users, err
}

func (r *UserRepository) Delete(filter dto.UserFilter) (int64, error) {
	result := r.db.Delete(&models.User{}, filter.Id)
	return result.RowsAffected, result.Error
}

func (r *UserRepository) Modify(filter dto.UserFilter) (int64, error) {
	result := r.db.Model(&models.User{}).Where("id = ?", filter.Id).Updates(models.User{
		Login:   filter.Login,
		Email:   &filter.Email,
		Name:    filter.Name,
		Surname: filter.Surname,
		Role:    filter.Role,
	})
	return result.RowsAffected, result.Error
}

func (r *UserRepository) IsDuplicatedKey(err error) bool {
	return errors.Is(err, gorm.ErrDuplicatedKey)
}
