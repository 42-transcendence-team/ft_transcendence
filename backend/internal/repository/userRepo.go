package repository

import (
	"backend/internal/db"
	"backend/internal/dto"
	appErr "backend/internal/errors"
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

// Peticiones para modificacion de usuario (Pestaña Settings)

func (r *UserRepository) GetUserData(userID uint) (*dto.UserResponse, error) {
	var user models.User

	err := r.db.Where("id = ?", userID).First(&user).Error
	if err != nil {
		return nil, err
	}

	// Añadir campos para modificar en Settings si fuera necesario
	response := dto.UserResponse{
		Login:     user.Login,
		Email:     user.Email,
		Name:      user.Name,
		Surname:   user.Surname,
		Birthday:  user.Birthday,
		Active2FA: user.Active2FA,
	}

	return &response, nil
}

func (r *UserRepository) Delete(request dto.UserDelete) (int64, error) {
	result := r.db.Delete(&models.User{}, request.Id)
	return result.RowsAffected, result.Error
}

func (r *UserRepository) GetPassword(userID uint) (string, error) {
	var user models.User
	err := r.db.Select("Password").Where("id = ?", userID).First(&user).Error
	if err != nil {
		return "", err
	}
	return user.Password, nil
}

func (r *UserRepository) UpdateUser(userID uint, request dto.ModifyInput) (int64, error) {
	updates := make(map[string]interface{})
	if request.Email != "" {
		updates["Email"] = request.Email
	}
	if request.Password != "" {
		updates["Password"] = request.Password
	}
	if request.Name != "" {
		updates["Name"] = request.Name
	}
	if request.Surname != "" {
		updates["Surname"] = request.Surname
	}
	if !request.Birthday.IsZero() {
		updates["Birthday"] = request.Birthday
	}

	result := r.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates)
	return result.RowsAffected, result.Error
}

// Funciones para 2FA
func (r *UserRepository) UpdateSecret2FA(request dto.UserSecret2FA) (int64, error) {
	result := r.db.Model(&models.User{}).Where("id = ?", request.Id).Update("Secret2FA", request.Secret2FA)
	return result.RowsAffected, result.Error
}

func (r *UserRepository) UpdateActive2FA(request dto.User2FAStatus) (int64, error) {
	result := r.db.Model(&models.User{}).Where("id = ?", request.Id).Update("Active2FA", request.Active2FA)
	return result.RowsAffected, result.Error
}

func (r *UserRepository) Remove2FA(request dto.UserRemove2FA) (int64, error) {
	result := r.db.Model(&models.User{}).
		Where("id = ?", request.Id).
		Updates(map[string]interface{}{
			"Secret2FA": nil,
			"Active2FA": false,
		})

	return result.RowsAffected, result.Error
}

func (r *UserRepository) Get2FASecret(userID uint) (string, error) {
	var user models.User
	err := r.db.Select("Secret2FA").Where("id = ?", userID).First(&user).Error
	if err != nil {
		return "", err
	}
	if user.Secret2FA == nil {
		return "", appErr.NewBadRequest("2FA Not enabled")
	}
	return *user.Secret2FA, nil
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
