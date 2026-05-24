package dto

import (
	"backend/internal/models"
	"time"
)

type CreateCommentRequest struct {
	Content string `json:"content"`
}

type CreateCommentInput struct {
	PostID  uint
	UserID  uint
	Content string
}

type CommentResponse struct {
	ID        uint               `json:"id"`
	PostID    uint               `json:"postId"`
	UserID    uint               `json:"userId"`
	Author    PostAuthorResponse `json:"author"`
	Content   string             `json:"content"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

func NewCommentResponse(comment models.Comment) CommentResponse {
	return CommentResponse{
		ID:     comment.ID,
		PostID: comment.PostID,
		UserID: comment.UserID,
		Author: PostAuthorResponse{
			ID:    comment.User.ID,
			Login: comment.User.Login,
		},
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	}
}

func NewCommentResponseList(comments []models.Comment) []CommentResponse {
	responses := make([]CommentResponse, 0, len(comments))

	for _, comment := range comments {
		responses = append(responses, NewCommentResponse(comment))
	}

	return responses
}
