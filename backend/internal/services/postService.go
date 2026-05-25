// Service = capa de lógica de negocio.
// Aquí se validan las reglas propias de los posts, como que el contenido
// no esté vacío o que no supere la longitud máxima.
// El handler recibe la petición HTTP y el repository habla con la DB;
// este archivo queda en medio para decidir si la operación tiene sentido.

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

func (s *PostService) CreatePost(input dto.CreatePostInput) (*dto.PostResponse, error) {
	content := strings.TrimSpace(input.Content)

	var contentPtr *string
	if content != "" {
		contentPtr = &content
	}

	var imagePathPtr *string
	if input.ImagePath != nil {
		imagePath := strings.TrimSpace(*input.ImagePath)
		if imagePath != "" {
			imagePathPtr = &imagePath
		}
	}

	if contentPtr == nil && imagePathPtr == nil {
		return nil, appErr.NewValidation(map[string]string{
			"post": "content_or_image_required",
		})
	}

	if contentPtr != nil && len([]rune(*contentPtr)) > maxPostContentLength {
		return nil, appErr.NewValidation(map[string]string{
			"content": "max",
		})
	}

	post := models.Post{
		UserID:    input.UserID,
		Content:   contentPtr,
		ImagePath: imagePathPtr,
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

func (s *PostService) DeletePost(userID uint, postID uint) (*string, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	if post.UserID != userID {
		return nil, appErr.NewForbidden("cannot_delete_other_user_post")
	}

	imagePath := post.ImagePath

	rows, err := s.postRepo.Delete(post)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	if rows == 0 {
		return nil, appErr.NewNotFound("post_not_found")
	}

	return imagePath, nil
}
