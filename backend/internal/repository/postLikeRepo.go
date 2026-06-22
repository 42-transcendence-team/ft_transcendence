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

// SetReaction crea la reacción o cambia la existente.
// La restricción única post_id + user_id garantiza una reacción por usuario.
func (r *PostLikeRepository) SetReaction(
	postID uint,
	userID uint,
	reaction int8,
) error {
	postReaction := models.PostLike{
		PostID:   postID,
		UserID:   userID,
		Reaction: reaction,
	}

	return r.db.
		Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "post_id"},
				{Name: "user_id"},
			},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"reaction":   reaction,
				"updated_at": gorm.Expr("CURRENT_TIMESTAMP"),
			}),
		}).
		Create(&postReaction).
		Error
}

// DeleteReaction elimina únicamente la reacción indicada.
// Quitar un like no debe borrar un dislike, ni al contrario.
func (r *PostLikeRepository) DeleteReaction(
	postID uint,
	userID uint,
	reaction int8,
) (int64, error) {
	result := r.db.
		Where(
			"post_id = ? AND user_id = ? AND reaction = ?",
			postID,
			userID,
			reaction,
		).
		Delete(&models.PostLike{})

	return result.RowsAffected, result.Error
}

func (r *PostLikeRepository) CountByPostIDAndReaction(
	postID uint,
	reaction int8,
) (int64, error) {
	var count int64

	err := r.db.
		Model(&models.PostLike{}).
		Where("post_id = ? AND reaction = ?", postID, reaction).
		Count(&count).
		Error

	return count, err
}

// GetReactionByPostAndUser devuelve:
// - la reacción encontrada;
// - si existe;
// - y el posible error de base de datos.
func (r *PostLikeRepository) GetReactionByPostAndUser(
	postID uint,
	userID uint,
) (int8, bool, error) {
	var postReaction models.PostLike

	err := r.db.
		Where("post_id = ? AND user_id = ?", postID, userID).
		First(&postReaction).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, false, nil
	}

	if err != nil {
		return 0, false, err
	}

	return postReaction.Reaction, true, nil
}

// Métodos de compatibilidad con el sistema actual de likes.
// Se retirarán o sustituirán cuando adaptemos el servicio.

func (r *PostLikeRepository) CreateIfNotExists(
	postID uint,
	userID uint,
) error {
	return r.SetReaction(postID, userID, models.PostReactionLike)
}

func (r *PostLikeRepository) DeleteByPostAndUser(
	postID uint,
	userID uint,
) (int64, error) {
	return r.DeleteReaction(
		postID,
		userID,
		models.PostReactionLike,
	)
}

func (r *PostLikeRepository) CountByPostID(
	postID uint,
) (int64, error) {
	return r.CountByPostIDAndReaction(
		postID,
		models.PostReactionLike,
	)
}

func (r *PostLikeRepository) ExistsByPostAndUser(
	postID uint,
	userID uint,
) (bool, error) {
	reaction, exists, err := r.GetReactionByPostAndUser(postID, userID)
	if err != nil {
		return false, err
	}

	return exists && reaction == models.PostReactionLike, nil
}
