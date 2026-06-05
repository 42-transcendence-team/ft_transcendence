package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PostLikeRepository struct {
	db *gorm.DB
}

func NewPostLikeRepository(db *gorm.DB) *PostLikeRepository {
	return &PostLikeRepository{
		db: db,
	}
}

func (r *PostLikeRepository) CreateIfNotExists(postID uint, userID uint) error {
	like := models.PostLike{
		PostID: postID,
		UserID: userID,
	}

	return r.db.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&like).
		Error
}

func (r *PostLikeRepository) DeleteByPostAndUser(postID uint, userID uint) (int64, error) {
	result := r.db.
		Where("post_id = ? AND user_id = ?", postID, userID).
		Delete(&models.PostLike{})

	return result.RowsAffected, result.Error
}

func (r *PostLikeRepository) CountByPostID(postID uint) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.PostLike{}).
		Where("post_id = ?", postID).
		Count(&count).
		Error

	return count, err
}

func (r *PostLikeRepository) ExistsByPostAndUser(postID uint, userID uint) (bool, error) {
	var like models.PostLike

	err := r.db.
		Where("post_id = ? AND user_id = ?", postID, userID).
		First(&like).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}
