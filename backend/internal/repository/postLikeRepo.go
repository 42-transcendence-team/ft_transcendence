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

// PostReactionCounts contiene los contadores agrupados de un post.
// Se utiliza en listados para no ejecutar dos consultas por cada tarjeta.
type PostReactionCounts struct {
	PostID       uint  `gorm:"column:post_id"`
	LikeCount    int64 `gorm:"column:like_count"`
	DislikeCount int64 `gorm:"column:dislike_count"`
}

func NewPostLikeRepository(
	db *gorm.DB,
) *PostLikeRepository {
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
			DoUpdates: clause.Assignments(
				map[string]interface{}{
					"reaction": reaction,
					"updated_at": gorm.Expr(
						"CURRENT_TIMESTAMP",
					),
				},
			),
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
		Where(
			"post_id = ? AND reaction = ?",
			postID,
			reaction,
		).
		Count(&count).
		Error

	return count, err
}

// CountGroupedByPostIDs obtiene likes y dislikes de todos los posts
// de una página mediante una única consulta agrupada.
func (r *PostLikeRepository) CountGroupedByPostIDs(
	postIDs []uint,
) (map[uint]PostReactionCounts, error) {
	countsByPostID := make(
		map[uint]PostReactionCounts,
		len(postIDs),
	)

	// Los posts sin reacciones también deben disponer de contadores a cero.
	for _, postID := range postIDs {
		countsByPostID[postID] = PostReactionCounts{
			PostID: postID,
		}
	}

	if len(postIDs) == 0 {
		return countsByPostID, nil
	}

	var groupedCounts []PostReactionCounts

	err := r.db.
		Model(&models.PostLike{}).
		Select(
			`
				post_id,
				SUM(
					CASE
						WHEN reaction = ? THEN 1
						ELSE 0
					END
				) AS like_count,
				SUM(
					CASE
						WHEN reaction = ? THEN 1
						ELSE 0
					END
				) AS dislike_count
			`,
			models.PostReactionLike,
			models.PostReactionDislike,
		).
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Scan(&groupedCounts).
		Error

	if err != nil {
		return nil, err
	}

	for _, counts := range groupedCounts {
		countsByPostID[counts.PostID] = counts
	}

	return countsByPostID, nil
}

// GetReactionByPostIDsAndUser devuelve la reacción del usuario actual
// en cada post de la página mediante una única consulta.
// Se utiliza en listados para no ejecutar una consulta por tarjeta.
func (r *PostLikeRepository) GetReactionByPostIDsAndUser(
	postIDs []uint,
	userID uint,
) (map[uint]int8, error) {
	reactionByPostID := make(
		map[uint]int8,
		len(postIDs),
	)

	if len(postIDs) == 0 {
		return reactionByPostID, nil
	}

	var postReactions []models.PostLike

	err := r.db.
		Where(
			"post_id IN ? AND user_id = ?",
			postIDs,
			userID,
		).
		Find(&postReactions).
		Error

	if err != nil {
		return nil, err
	}

	for _, postReaction := range postReactions {
		reactionByPostID[postReaction.PostID] =
			postReaction.Reaction
	}

	return reactionByPostID, nil
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
		Where(
			"post_id = ? AND user_id = ?",
			postID,
			userID,
		).
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
// Se mantienen mientras otros componentes continúen utilizándolos.

func (r *PostLikeRepository) CreateIfNotExists(
	postID uint,
	userID uint,
) error {
	return r.SetReaction(
		postID,
		userID,
		models.PostReactionLike,
	)
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
	reaction, exists, err :=
		r.GetReactionByPostAndUser(
			postID,
			userID,
		)

	if err != nil {
		return false, err
	}

	return exists &&
		reaction == models.PostReactionLike, nil
}
