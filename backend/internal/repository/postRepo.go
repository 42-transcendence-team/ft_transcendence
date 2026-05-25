package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{
		db: db,
	}
}

func (r *PostRepository) Create(post *models.Post) (*models.Post, error) {
	if err := r.db.Create(post).Error; err != nil {
		return nil, err
	}

	return r.FindByID(post.ID)
}

func (r *PostRepository) FindByID(postID uint) (*models.Post, error) {
	var post models.Post

	err := r.db.
		Preload("User").
		First(&post, postID).
		Error

	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *PostRepository) Delete(post *models.Post) (int64, error) {
	result := r.db.Select("Comments").Delete(post)
	return result.RowsAffected, result.Error
}
