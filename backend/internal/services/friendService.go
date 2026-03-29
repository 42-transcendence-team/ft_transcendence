package services

import (
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
)

type FriendService struct {
	friendsRepo *repository.FriendRepository
	userRepo    *repository.UserRepository
}

func NewFriendService(friendRepo *repository.FriendRepository, userRepo *repository.UserRepository) *FriendService {
	return &FriendService{
		friendsRepo: friendRepo,
		userRepo:    userRepo,
	}
}

func (s *FriendService) SendRequest(receiverID uint, userID uint) (*models.User, error) {

	// comprobar que el receptor existe
	newFriend, err := s.userRepo.FindById(receiverID)
	if err != nil {
		return nil, err
	}

	// comprobar que no son amigos
	areFriends, err := s.friendsRepo.AreFriends(userID, receiverID)
	if areFriends == true {
		return nil, appErr.NewConflict("already friends")
	}

	// comprobar que no hay bloqueo
	areBlock, err := s.friendsRepo.AreBlock(userID, receiverID)
	if areBlock == true {
		return nil, appErr.NewConflict("user block")
	}

	// comprobar que no hay solicitud pendiente
	isRequest, err := s.friendsRepo.IsRequest(userID, receiverID)
	if isRequest == true {
		return nil, appErr.NewConflict("already friend requets")
	}

	err = s.friendsRepo.SendFriendRequest(userID, receiverID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return newFriend, nil
}
