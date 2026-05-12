package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"

	"gorm.io/gorm"
)

type BlockUserService struct {
	friendsRepo *repository.FriendRepository
	userRepo    *repository.UserRepository
}

func NewBlockUserService(friendRepo *repository.FriendRepository, userRepo *repository.UserRepository) *BlockUserService {
	return &BlockUserService{
		friendsRepo: friendRepo,
		userRepo:    userRepo,
	}
}

func (s *BlockUserService) ListBlocks(userID uint) ([]dto.BlocksResponse, error) {

	requests, err := s.friendsRepo.ListBlocks(userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	BlockRequest, err := s.MapToBlocksResponse(requests, userID)
	if err != nil {
		return nil, err
	}

	return BlockRequest, nil
}
/*type Block struct {
	ID        uint `gorm:"primaryKey"`
	BlockerID uint `gorm:"not null;index"`
	BlockedID uint `gorm:"not null;index"`
	CreatedAt time.Time
}*/
func (s *BlockUserService) MapToBlocksResponse(reqs []models.Block, currentUserID uint) ([]dto.BlocksResponse, error) {
	var res []dto.BlocksResponse

	for _, r := range reqs {
		blocked, err := s.userRepo.FindById(r.BlockedID)
        if err != nil {
            return nil, appErr.NewNotFound("User not found")
        }
		res = append(res, dto.BlocksResponse{
			UserID:   r.BlockedID,
			Username: blocked.Login,
		})
	}

	return res, nil
}

func (s *BlockUserService) BlockUser(blockerID uint, blockedID uint) error {
	err := s.friendsRepo.CreateBlock(blockerID, blockedID)
	s.friendsRepo.DeleteFriendship(blockedID, blockerID)
	if err != nil {
		if s.userRepo.IsDuplicatedKey(err) {
			return appErr.NewBadRequest("User already blocked")
		}
		return appErr.NewInternal(err)
	}

	return nil
}

func (s *BlockUserService) UnblockUser(blockerID uint, blockedID uint) error {
	err := s.friendsRepo.DeleteBlock(blockerID, blockedID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return appErr.NewNotFound("Block not found")
		}
		return appErr.NewInternal(err)
	}

	return nil
}