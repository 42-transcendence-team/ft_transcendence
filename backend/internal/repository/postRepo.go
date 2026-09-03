// Repository: capa encargada de acceder a la base de datos.
// Este archivo no contiene reglas de negocio.
// Su responsabilidad es guardar, buscar, listar o borrar posts mediante GORM.

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

func (r *PostRepository) Create(
	post *models.Post,
) (*models.Post, error) {
	if err := r.db.Create(post).Error; err != nil {
		return nil, err
	}

	return r.FindByID(post.ID)
}

func (r *PostRepository) FindByID(
	postID uint,
) (*models.Post, error) {
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

// ListFeedByFriendships obtiene únicamente publicaciones de usuarios
// que tienen una relación registrada en la tabla friendships.
func (r *PostRepository) ListFeedByFriendships(
	currentUserID uint,
	page int,
	limit int,
) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	friendshipJoin := `
		JOIN friendships
			ON (
				(
					friendships.user1_id = ?
					AND friendships.user2_id = posts.user_id
				)
				OR
				(
					friendships.user2_id = ?
					AND friendships.user1_id = posts.user_id
				)
			)
	`

	countQuery := r.db.
		Model(&models.Post{}).
		Joins(
			friendshipJoin,
			currentUserID,
			currentUserID,
		)

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		Model(&models.Post{}).
		Joins(
			friendshipJoin,
			currentUserID,
			currentUserID,
		).
		Preload("User").
		Order("posts.created_at DESC, posts.id DESC").
		Offset(postPaginationOffset(page, limit)).
		Limit(limit).
		Find(&posts).
		Error

	if err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

// ListFeedForUser obtiene las publicaciones del usuario autenticado
// y de los usuarios con los que tiene una amistad registrada.
func (r *PostRepository) ListFeedForUser(
	currentUserID uint,
	page int,
	limit int,
) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	feedCondition := `
  (
        		posts.user_id = ?
        		OR EXISTS (
        			SELECT 1
        			FROM friendships
        			WHERE (
        				friendships.user1_id = ?
        				AND friendships.user2_id = posts.user_id
        			)
        			OR (
        				friendships.user2_id = ?
        				AND friendships.user1_id = posts.user_id
        			)
        		)
  )
	`

	countQuery := r.db.
		Model(&models.Post{}).
		Where(
			feedCondition,
			currentUserID,
			currentUserID,
			currentUserID,
		)

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		Model(&models.Post{}).
		Where(
			feedCondition,
			currentUserID,
			currentUserID,
			currentUserID,
		).
		Preload("User").
		Order("posts.created_at DESC, posts.id DESC").
		Offset(postPaginationOffset(page, limit)).
		Limit(limit).
		Find(&posts).
		Error

	if err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

func (r *PostRepository) ListByUserID(
	userID uint,
	page int,
	limit int,
) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	if err := r.db.
		Model(&models.Post{}).
		Where("posts.user_id = ?", userID).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		Model(&models.Post{}).
		Where("posts.user_id = ?", userID).
		Preload("User").
		Order("posts.created_at DESC, posts.id DESC").
		Offset(postPaginationOffset(page, limit)).
		Limit(limit).
		Find(&posts).
		Error

	if err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

func (r *PostRepository) Delete(
	post *models.Post,
) (int64, error) {
	result := r.db.
		Select("Comments", "Likes").
		Delete(post)

	return result.RowsAffected, result.Error
}

func postPaginationOffset(
	page int,
	limit int,
) int {
	return (page - 1) * limit
}
