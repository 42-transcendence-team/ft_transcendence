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

const maxPostContentLength = 5000

type PostService struct {
	postRepo *repository.PostRepository
}

func NewPostService(postRepo *repository.PostRepository) *PostService {
	return &PostService{
		postRepo: postRepo,
	}
}

func (s *PostService) CreateTextPost(input dto.CreatePostInput) (*dto.PostResponse, error) {
	content := strings.TrimSpace(input.Content)

	if content == "" {
		return nil, appErr.NewValidation(map[string]string{
			"content": "required",
		})
	}

	if len([]rune(content)) > maxPostContentLength {
		return nil, appErr.NewValidation(map[string]string{
			"content": "max",
		})
	}

	post := models.Post{
		UserID:    input.UserID,
		Content:   &content,
		ImagePath: nil,
	}

	createdPost, err := s.postRepo.Create(&post)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	response := dto.NewPostResponse(*createdPost)
	return &response, nil
}

func (s *PostService) GetPostByID(postID uint) (*dto.PostResponse, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	response := dto.NewPostResponse(*post)
	return &response, nil
}
