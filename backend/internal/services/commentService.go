package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

const maxCommentContentLength = 1000

type CommentService struct {
	commentRepo *repository.CommentRepository
	postRepo    *repository.PostRepository
}

func NewCommentService(commentRepo *repository.CommentRepository, postRepo *repository.PostRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		postRepo:    postRepo,
	}
}

func (s *CommentService) CreateComment(input dto.CreateCommentInput) (*dto.CommentResponse, error) {
	content := strings.TrimSpace(input.Content)

	if content == "" {
		return nil, appErr.NewValidation(map[string]string{
			"content": "required",
		})
	}

	if len([]rune(content)) > maxCommentContentLength {
		return nil, appErr.NewValidation(map[string]string{
			"content": "max",
		})
	}

	_, err := s.postRepo.FindByID(input.PostID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	comment := models.Comment{
		PostID:  input.PostID,
		UserID:  input.UserID,
		Content: content,
	}

	createdComment, err := s.commentRepo.Create(&comment)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	response := dto.NewCommentResponse(*createdComment)
	return &response, nil
}

func (s *CommentService) ListCommentsByPostID(postID uint) ([]dto.CommentResponse, error) {
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	comments, err := s.commentRepo.ListByPostID(postID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return dto.NewCommentResponseList(comments), nil
}
