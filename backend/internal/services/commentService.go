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
	friendRepo  *repository.FriendRepository
}

func NewCommentService(commentRepo *repository.CommentRepository, postRepo *repository.PostRepository, friendRepo *repository.FriendRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		postRepo:    postRepo,
		friendRepo:  friendRepo,
	}
}

func (s *CommentService) CreateComment(input dto.CreateCommentInput) (*dto.CommentResponse, uint, error) {
	content := strings.TrimSpace(input.Content)

	if content == "" {
		return nil, 0, appErr.NewValidation(map[string]string{
			"content": "required",
		})
	}

	if len([]rune(content)) > maxCommentContentLength {
		return nil, 0, appErr.NewValidation(map[string]string{
			"content": "max",
		})
	}

	post, err := s.postRepo.FindByID(input.PostID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, appErr.NewNotFound("post_not_found")
		}
		return nil, 0, appErr.NewInternal(err)
	}

	if err := requirePostAccess(
		s.friendRepo,
		post,
		input.UserID,
	); err != nil {
		return nil, 0, err
	}

	comment := models.Comment{
		PostID:  input.PostID,
		UserID:  input.UserID,
		Content: content,
	}

	createdComment, err := s.commentRepo.Create(&comment)
	if err != nil {
		return nil, 0, appErr.NewInternal(err)
	}

	response := dto.NewCommentResponse(*createdComment)
	return &response, post.UserID, nil
}

func (s *CommentService) ListCommentsByPostID(postID uint, currentUserID uint) ([]dto.CommentResponse, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	if err := requirePostAccess(
		s.friendRepo,
		post,
		currentUserID,
	); err != nil {
		return nil, err
	}

	comments, err := s.commentRepo.ListByPostID(postID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return dto.NewCommentResponseList(comments), nil
}

func (s *CommentService) DeleteComment(userID uint, commentID uint) error {
	comment, err := s.commentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return appErr.NewNotFound("comment_not_found")
		}
		return appErr.NewInternal(err)
	}

	if comment.UserID != userID {
		return appErr.NewForbidden("cannot_delete_other_user_comment")
	}

	rows, err := s.commentRepo.Delete(comment)
	if err != nil {
		return appErr.NewInternal(err)
	}

	if rows == 0 {
		return appErr.NewNotFound("comment_not_found")
	}

	return nil
}
