package dto

import (
	"backend/internal/models"
	"time"
)

type CreatePostRequest struct {
	Content string `json:"content" form:"content"`
}

type CreatePostInput struct {
	UserID    uint
	Content   string
	ImagePath *string
}

type PostAuthorResponse struct {
	ID         uint    `json:"id"`
	Login      string  `json:"login"`
	AvatarPath *string `json:"avatarPath"`
}

type PostResponse struct {
	ID                    uint               `json:"id"`
	UserID                uint               `json:"userId"`
	Author                PostAuthorResponse `json:"author"`
	Content               *string            `json:"content,omitempty"`
	ImagePath             *string            `json:"imagePath,omitempty"`
	LikeCount             int64              `json:"likeCount"`
	DislikeCount          int64              `json:"dislikeCount"`
	LikedByCurrentUser    bool               `json:"likedByCurrentUser"`
	DislikedByCurrentUser bool               `json:"dislikedByCurrentUser"`
	CreatedAt             time.Time          `json:"createdAt"`
	UpdatedAt             time.Time          `json:"updatedAt"`
}

// NewPostResponse transforma el modelo de GORM en un DTO seguro para la API.
// No devolvemos models.Post directamente porque, al usar Preload("User"),
// GORM carga el usuario completo asociado al post. Ese modelo puede contener
// campos internos o sensibles como password, 2FA, email o roles.
// Aquí controlamos explícitamente qué datos salen al frontend.
//
// Un DTO (Data Transfer Object) define qué datos entran o salen por la API,
// separándolos del modelo de base de datos.
func NewPostResponse(
	post models.Post,
	likeCount int64,
	dislikeCount int64,
	likedByCurrentUser bool,
	dislikedByCurrentUser bool,
) PostResponse {
	return PostResponse{
		ID:     post.ID,
		UserID: post.UserID,
		Author: PostAuthorResponse{
			ID:         post.User.ID,
			Login:      post.User.Login,
			AvatarPath: post.User.AvatarPath,
		},
		Content:               post.Content,
		ImagePath:             post.ImagePath,
		LikeCount:             likeCount,
		DislikeCount:          dislikeCount,
		LikedByCurrentUser:    likedByCurrentUser,
		DislikedByCurrentUser: dislikedByCurrentUser,
		CreatedAt:             post.CreatedAt,
		UpdatedAt:             post.UpdatedAt,
	}
}
