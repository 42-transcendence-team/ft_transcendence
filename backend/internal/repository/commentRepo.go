package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

func (r *CommentRepository) Create(comment *models.Comment) (*models.Comment, error) {
	if err := r.db.Create(comment).Error; err != nil {
		return nil, err
	}

	return r.FindByID(comment.ID)
}

func (r *CommentRepository) FindByID(commentID uint) (*models.Comment, error) {
	var comment models.Comment

	err := r.db.
		Preload("User").
		First(&comment, commentID).
		Error

	if err != nil {
		return nil, err
	}

	return &comment, nil
}

func (r *CommentRepository) ListByPostID(postID uint) ([]models.Comment, error) {
	var comments []models.Comment

	err := r.db.
		Preload("User").
		Where("post_id = ?", postID).
		Order("created_at ASC").
		Find(&comments).
		Error

	if err != nil {
		return nil, err
	}

	return comments, nil
}

func (r *CommentRepository) Delete(comment *models.Comment) (int64, error) {
	result := r.db.Delete(comment)
	return result.RowsAffected, result.Error
}
