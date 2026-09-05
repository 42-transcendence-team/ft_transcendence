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
	FileName  *string
}

type PostAuthorResponse struct {
	ID         uint    `json:"id"`
	Login      string  `json:"login"`
	AvatarPath *string `json:"avatarPath,omitempty"`
}

type PostResponse struct {
	ID                    uint               `json:"id"`
	UserID                uint               `json:"userId"`
	Author                PostAuthorResponse `json:"author"`
	Content               *string            `json:"content,omitempty"`
	ImagePath             *string            `json:"imagePath,omitempty"`
	FileName              *string            `json:"fileName,omitempty"`
	LikeCount             int64              `json:"likeCount"`
	DislikeCount          int64              `json:"dislikeCount"`
	LikedByCurrentUser    bool               `json:"likedByCurrentUser"`
	DislikedByCurrentUser bool               `json:"dislikedByCurrentUser"`
	CreatedAt             time.Time          `json:"createdAt"`
	UpdatedAt             time.Time          `json:"updatedAt"`
}

type PostSummaryResponse struct {
	ID                    uint               `json:"id"`
	UserID                uint               `json:"userId"`
	Author                PostAuthorResponse `json:"author"`
	Content               *string            `json:"content,omitempty"`
	ImagePath             *string            `json:"imagePath,omitempty"`
	FileName              *string            `json:"fileName,omitempty"`
	LikeCount             int64              `json:"likeCount"`
	DislikeCount          int64              `json:"dislikeCount"`
	LikedByCurrentUser    bool               `json:"likedByCurrentUser"`
	DislikedByCurrentUser bool               `json:"dislikedByCurrentUser"`
	CreatedAt             time.Time          `json:"createdAt"`
}

type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

type PostListResponse struct {
	Data       []PostSummaryResponse `json:"data"`
	Pagination PaginationResponse    `json:"pagination"`
}

// NewPostResponse transforma el modelo de GORM en un DTO seguro.
// El usuario precargado puede contener información privada, por lo que
// únicamente se exponen los campos necesarios para mostrar al autor.
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
		FileName:              post.FileName,
		LikeCount:             likeCount,
		DislikeCount:          dislikeCount,
		LikedByCurrentUser:    likedByCurrentUser,
		DislikedByCurrentUser: dislikedByCurrentUser,
		CreatedAt:             post.CreatedAt,
		UpdatedAt:             post.UpdatedAt,
	}
}

func NewPostSummaryResponse(
	post models.Post,
	likeCount int64,
	dislikeCount int64,
	likedByCurrentUser bool,
	dislikedByCurrentUser bool,
) PostSummaryResponse {
	return PostSummaryResponse{
		ID:     post.ID,
		UserID: post.UserID,
		Author: PostAuthorResponse{
			ID:         post.User.ID,
			Login:      post.User.Login,
			AvatarPath: post.User.AvatarPath,
		},
		Content:               post.Content,
		ImagePath:             post.ImagePath,
		FileName:              post.FileName,
		LikeCount:             likeCount,
		DislikeCount:          dislikeCount,
		LikedByCurrentUser:    likedByCurrentUser,
		DislikedByCurrentUser: dislikedByCurrentUser,
		CreatedAt:             post.CreatedAt,
	}
}
