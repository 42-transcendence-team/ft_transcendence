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

/*
requests, err := s.friendsRepo.ListFriends(userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return requests, nil
*/

// error
// return appErr.NewNotFound("")
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

/*
	type Block struct {
		ID        uint `gorm:"primaryKey"`
		BlockerID uint `gorm:"not null;index"`
		BlockedID uint `gorm:"not null;index"`
		CreatedAt time.Time
	}
*/

func (s *BlockUserService) MapToBlocksResponse(reqs []models.Block, currentUserID uint) ([]dto.BlocksResponse, error) {
	res := make([]dto.BlocksResponse, 0)

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

	if blockedID == blockerID {
		return appErr.NewBadRequest("you cannot block yourself")
	}

	_, ferr := s.userRepo.FindById(blockedID)
	if ferr != nil {
		return appErr.NewNotFound("user not found")
	}

	err := s.friendsRepo.CreateBlock(blockerID, blockedID) //aqui ya no son amigos, asi que creo bloqueo
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return appErr.NewConflict("user already blocked")
		}
		return appErr.NewInternal(err)
	}

	derr := s.friendsRepo.DeleteFriendship(blockerID, blockedID)
	if derr != nil && !errors.Is(derr, gorm.ErrRecordNotFound) {
		return appErr.NewInternal(derr)
	}

	err = s.friendsRepo.DeletePendingRequestsBetweenUsers(blockerID, blockedID)
	if err != nil {
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
