package dto

import "time"

type CreatePostRequest struct {
	Body string `form:"body"`
}

type CreateCommentRequest struct {
	Body string `json:"body" binding:"required"`
}

type AuthorResponse struct {
	ID      uint   `json:"id"`
	Login   string `json:"login"`
	Name    string `json:"name"`
	Surname string `json:"surname"`
}

type PostMediaResponse struct {
	ID       uint   `json:"id"`
	URL      string `json:"url"`
	MimeType string `json:"mime_type"`
}

type PostResponse struct {
	ID           uint                `json:"id"`
	Author       AuthorResponse      `json:"author"`
	Body         *string             `json:"body"`
	Media        []PostMediaResponse `json:"media"`
	CommentCount int64               `json:"comment_count"`
	CanDelete    bool                `json:"can_delete"`
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
}

type CommentResponse struct {
	ID        uint           `json:"id"`
	PostID    uint           `json:"post_id"`
	Author    AuthorResponse `json:"author"`
	Body      string         `json:"body"`
	CreatedAt time.Time      `json:"created_at"`
}
