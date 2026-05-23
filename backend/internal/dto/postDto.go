package dto

import (
	"backend/internal/models"
	"time"
)

type CreatePostRequest struct {
	Content string `json:"content" form:"content"`
}

type CreatePostInput struct {
	UserID  uint
	Content string
}

type PostAuthorResponse struct {
	ID    uint   `json:"id"`
	Login string `json:"login"`
}

type PostResponse struct {
	ID        uint               `json:"id"`
	UserID    uint               `json:"userId"`
	Author    PostAuthorResponse `json:"author"`
	Content   *string            `json:"content,omitempty"`
	ImagePath *string            `json:"imagePath,omitempty"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

func NewPostResponse(post models.Post) PostResponse {
	return PostResponse{
		ID:     post.ID,
		UserID: post.UserID,
		Author: PostAuthorResponse{
			ID:    post.User.ID,
			Login: post.User.Login,
		},
		Content:   post.Content,
		ImagePath: post.ImagePath,
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt,
	}
}
