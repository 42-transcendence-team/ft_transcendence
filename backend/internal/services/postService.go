package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/storage"
	"errors"
	"mime/multipart"
	"strings"

	"gorm.io/gorm"
)

const (
	maxPostBodyLength    = 2000
	maxCommentBodyLength = 1000
)

type PostService struct {
	postRepo   *repository.PostRepository
	imageStore *storage.PostImageStorage
}

func NewPostService(
	postRepo *repository.PostRepository,
	imageStore *storage.PostImageStorage,
) *PostService {
	return &PostService{
		postRepo:   postRepo,
		imageStore: imageStore,
	}
}

func (s *PostService) CreatePost(userID uint, body string, image *multipart.FileHeader) (*dto.PostResponse, error) {
	body = strings.TrimSpace(body)

	if body == "" && image == nil {
		return nil, appErr.NewBadRequest("post must contain text or image")
	}

	if len(body) > maxPostBodyLength {
		return nil, appErr.NewBadRequest("post body is too long")
	}

	var bodyPtr *string
	if body != "" {
		bodyPtr = &body
	}

	var createdPost models.Post
	var savedImage *storage.SavedPostImage

	err := s.postRepo.DB().Transaction(func(tx *gorm.DB) error {
		post := models.Post{
			AuthorID: userID,
			Body:     bodyPtr,
		}

		if err := s.postRepo.CreatePost(tx, &post); err != nil {
			return err
		}

		createdPost = post

		if image != nil {
			var err error

			savedImage, err = s.imageStore.SavePostImage(post.ID, image)
			if err != nil {
				return err
			}

			media := models.PostMedia{
				PostID:       post.ID,
				UploaderID:   userID,
				FileURL:      savedImage.URL,
				StoragePath:  savedImage.StoragePath,
				OriginalName: savedImage.OriginalName,
				MimeType:     savedImage.MimeType,
				SizeBytes:    savedImage.SizeBytes,
			}

			if err := s.postRepo.CreatePostMedia(tx, &media); err != nil {
				_ = s.imageStore.DeleteFile(savedImage.StoragePath)
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	post, err := s.postRepo.FindByID(createdPost.ID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.mapPostToResponse(*post, userID)
}

func (s *PostService) ListPosts(userID uint, page int, limit int) ([]dto.PostResponse, error) {
	posts, err := s.postRepo.FindFeed(page, limit)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	response := make([]dto.PostResponse, 0, len(posts))

	for _, post := range posts {
		postResponse, err := s.mapPostToResponse(post, userID)
		if err != nil {
			return nil, err
		}

		response = append(response, *postResponse)
	}

	return response, nil
}

func (s *PostService) GetPostByID(userID uint, postID uint) (*dto.PostResponse, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post not found")
		}
		return nil, appErr.NewInternal(err)
	}

	return s.mapPostToResponse(*post, userID)
}

func (s *PostService) DeletePost(userID uint, postID uint) error {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return appErr.NewNotFound("post not found")
		}
		return appErr.NewInternal(err)
	}

	if post.AuthorID != userID {
		return appErr.NewForbidden("you cannot delete this post")
	}

	for _, media := range post.Media {
		_ = s.imageStore.DeleteFile(media.StoragePath)
	}

	if err := s.postRepo.DeletePostHard(post); err != nil {
		return appErr.NewInternal(err)
	}

	return nil
}

func (s *PostService) CreateComment(userID uint, postID uint, body string) (*dto.CommentResponse, error) {
	body = strings.TrimSpace(body)

	if body == "" {
		return nil, appErr.NewBadRequest("comment cannot be empty")
	}

	if len(body) > maxCommentBodyLength {
		return nil, appErr.NewBadRequest("comment is too long")
	}

	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post not found")
		}
		return nil, appErr.NewInternal(err)
	}

	comment := models.Comment{
		PostID:   postID,
		AuthorID: userID,
		Body:     body,
	}

	if err := s.postRepo.CreateComment(&comment); err != nil {
		return nil, appErr.NewInternal(err)
	}

	comments, err := s.postRepo.FindCommentsByPostID(postID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	for _, foundComment := range comments {
		if foundComment.ID == comment.ID {
			return s.mapCommentToResponse(foundComment), nil
		}
	}

	return s.mapCommentToResponse(comment), nil
}

func (s *PostService) ListComments(postID uint) ([]dto.CommentResponse, error) {
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post not found")
		}
		return nil, appErr.NewInternal(err)
	}

	comments, err := s.postRepo.FindCommentsByPostID(postID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	response := make([]dto.CommentResponse, 0, len(comments))

	for _, comment := range comments {
		response = append(response, *s.mapCommentToResponse(comment))
	}

	return response, nil
}

func (s *PostService) mapPostToResponse(post models.Post, currentUserID uint) (*dto.PostResponse, error) {
	commentCount, err := s.postRepo.CountComments(post.ID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	mediaResponse := make([]dto.PostMediaResponse, 0, len(post.Media))

	for _, media := range post.Media {
		mediaResponse = append(mediaResponse, dto.PostMediaResponse{
			ID:       media.ID,
			URL:      media.FileURL,
			MimeType: media.MimeType,
		})
	}

	return &dto.PostResponse{
		ID: post.ID,
		Author: dto.AuthorResponse{
			ID:      post.Author.ID,
			Login:   post.Author.Login,
			Name:    post.Author.Name,
			Surname: post.Author.Surname,
		},
		Body:         post.Body,
		Media:        mediaResponse,
		CommentCount: commentCount,
		CanDelete:    post.AuthorID == currentUserID,
		CreatedAt:    post.CreatedAt,
		UpdatedAt:    post.UpdatedAt,
	}, nil
}

func (s *PostService) mapCommentToResponse(comment models.Comment) *dto.CommentResponse {
	return &dto.CommentResponse{
		ID:     comment.ID,
		PostID: comment.PostID,
		Author: dto.AuthorResponse{
			ID:      comment.Author.ID,
			Login:   comment.Author.Login,
			Name:    comment.Author.Name,
			Surname: comment.Author.Surname,
		},
		Body:      comment.Body,
		CreatedAt: comment.CreatedAt,
	}
}
