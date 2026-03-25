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

func (r *UserRepository) Filter(request dto.UserFilter) ([]models.User, error) {
	var users []models.User
	query := r.db.Model(&models.User{})

	if request.Login != "" {
		query = query.Where("login LIKE ?", "%"+request.Login+"%")
	}
	if request.Email != "" {
		query = query.Where("email LIKE ?", "%"+request.Email+"%")
	}
	// Con Name y Surname tengo la duda de como se va a pasar desde el front, un solo input (?)
	if request.Name != "" {
		query = query.Where("name LIKE ?", "%"+request.Name+"%")
	}
	if request.Surname != "" {
		query = query.Where("surname LIKE ?", "%"+request.Surname+"%")
	}
	// Aqui el rol cambiará, ya que no se si sera un select o asi en frontend por lo que no sera necesario el Like
	if request.Role != "" {
		query = query.Where("role LIKE ?", "%"+request.Role+"%")
	}

	err := query.Scopes(db.Paginate(request.Page, request.Limit)).Find(&users).Error
	return users, err
}

func (r *UserRepository) Delete(request dto.UserDelete) (int64, error) {
	result := r.db.Delete(&models.User{}, request.Id)
	return result.RowsAffected, result.Error
}

func (r *UserRepository) Modify(request dto.UserModify) (int64, error) {
	result := r.db.Model(&models.User{}).Where("id = ?", request.Id).Updates(models.User{
		Login:   request.Login,
		Email:   &request.Email,
		Name:    request.Name,
		Surname: request.Surname,
		Role:    request.Role,
	})
	return result.RowsAffected, result.Error
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

func (r *UserRepository) FindById(userID uint) (*models.User, error) {

	var user models.User

	err := r.db.Where("ID = ?", userID).First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, err
}
