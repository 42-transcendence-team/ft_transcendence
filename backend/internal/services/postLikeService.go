package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"

	"gorm.io/gorm"
)

type PostLikeService struct {
	postRepo     *repository.PostRepository
	postLikeRepo *repository.PostLikeRepository
}

func NewPostLikeService(
	postRepo *repository.PostRepository,
	postLikeRepo *repository.PostLikeRepository,
) *PostLikeService {
	return &PostLikeService{
		postRepo:     postRepo,
		postLikeRepo: postLikeRepo,
	}
}

// LikePost crea un like o sustituye un dislike existente.
func (s *PostLikeService) LikePost(
	userID uint,
	postID uint,
) (*dto.PostLikeStateResponse, error) {
	if err := s.ensurePostExists(postID); err != nil {
		return nil, err
	}

	if err := s.postLikeRepo.SetReaction(
		postID,
		userID,
		models.PostReactionLike,
	); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildReactionState(postID, userID)
}

// UnlikePost elimina el like del usuario.
// No elimina nada si actualmente tiene un dislike o ninguna reacción.
func (s *PostLikeService) UnlikePost(
	userID uint,
	postID uint,
) (*dto.PostLikeStateResponse, error) {
	if err := s.ensurePostExists(postID); err != nil {
		return nil, err
	}

	if _, err := s.postLikeRepo.DeleteReaction(
		postID,
		userID,
		models.PostReactionLike,
	); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildReactionState(postID, userID)
}

// DislikePost crea un dislike o sustituye un like existente.
func (s *PostLikeService) DislikePost(
	userID uint,
	postID uint,
) (*dto.PostLikeStateResponse, error) {
	if err := s.ensurePostExists(postID); err != nil {
		return nil, err
	}

	if err := s.postLikeRepo.SetReaction(
		postID,
		userID,
		models.PostReactionDislike,
	); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildReactionState(postID, userID)
}

// UndislikePost elimina el dislike del usuario.
// No elimina nada si actualmente tiene un like o ninguna reacción.
func (s *PostLikeService) UndislikePost(
	userID uint,
	postID uint,
) (*dto.PostLikeStateResponse, error) {
	if err := s.ensurePostExists(postID); err != nil {
		return nil, err
	}

	if _, err := s.postLikeRepo.DeleteReaction(
		postID,
		userID,
		models.PostReactionDislike,
	); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildReactionState(postID, userID)
}

func (s *PostLikeService) ensurePostExists(postID uint) error {
	_, err := s.postRepo.FindByID(postID)
	if err == nil {
		return nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return appErr.NewNotFound("post_not_found")
	}

	return appErr.NewInternal(err)
}

func (s *PostLikeService) buildReactionState(
	postID uint,
	userID uint,
) (*dto.PostLikeStateResponse, error) {
	likeCount, err := s.postLikeRepo.CountByPostIDAndReaction(
		postID,
		models.PostReactionLike,
	)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	dislikeCount, err := s.postLikeRepo.CountByPostIDAndReaction(
		postID,
		models.PostReactionDislike,
	)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	currentReaction, exists, err :=
		s.postLikeRepo.GetReactionByPostAndUser(postID, userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return &dto.PostLikeStateResponse{
		PostID:                postID,
		LikeCount:             likeCount,
		DislikeCount:          dislikeCount,
		LikedByCurrentUser:    exists && currentReaction == models.PostReactionLike,
		DislikedByCurrentUser: exists && currentReaction == models.PostReactionDislike,
	}, nil
}
