package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
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

func (s *PostLikeService) LikePost(userID uint, postID uint) (*dto.PostLikeStateResponse, error) {
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	if err := s.postLikeRepo.CreateIfNotExists(postID, userID); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildLikeState(postID, userID)
}

func (s *PostLikeService) UnlikePost(userID uint, postID uint) (*dto.PostLikeStateResponse, error) {
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("post_not_found")
		}
		return nil, appErr.NewInternal(err)
	}

	if _, err := s.postLikeRepo.DeleteByPostAndUser(postID, userID); err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildLikeState(postID, userID)
}

func (s *PostLikeService) buildLikeState(postID uint, userID uint) (*dto.PostLikeStateResponse, error) {
	likeCount, err := s.postLikeRepo.CountByPostID(postID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	likedByCurrentUser, err := s.postLikeRepo.ExistsByPostAndUser(postID, userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return &dto.PostLikeStateResponse{
		PostID:             postID,
		LikeCount:          likeCount,
		LikedByCurrentUser: likedByCurrentUser,
	}, nil
}
