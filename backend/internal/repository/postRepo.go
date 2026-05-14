package repository

import (
	"backend/internal/db"
	"backend/internal/models"

	"gorm.io/gorm"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) CreatePost(tx *gorm.DB, post *models.Post) error {
	return tx.Create(post).Error
}

func (r *PostRepository) CreatePostMedia(tx *gorm.DB, media *models.PostMedia) error {
	return tx.Create(media).Error
}

func (r *PostRepository) FindFeed(page, limit int) ([]models.Post, error) {
	var posts []models.Post

	err := r.db.
		Scopes(db.Paginate(page, limit)).
		Preload("Author").
		Preload("Media").
		Order("created_at DESC").
		Find(&posts).Error

	return posts, err
}

func (r *PostRepository) FindByID(postID uint) (*models.Post, error) {
	var post models.Post

	err := r.db.
		Preload("Author").
		Preload("Media").
		First(&post, postID).Error

	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *PostRepository) DeletePostHard(post *models.Post) error {
	return r.db.Unscoped().Delete(post).Error
}

func (r *PostRepository) CountComments(postID uint) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.Comment{}).
		Where("post_id = ?", postID).
		Count(&count).Error

	return count, err
}

func (r *PostRepository) CreateComment(comment *models.Comment) error {
	return r.db.Create(comment).Error
}

func (r *PostRepository) FindCommentsByPostID(postID uint) ([]models.Comment, error) {
	var comments []models.Comment

	err := r.db.
		Preload("Author").
		Where("post_id = ?", postID).
		Order("created_at ASC").
		Find(&comments).Error

	return comments, err
}

func (r *PostRepository) DB() *gorm.DB {
	return r.db
}
