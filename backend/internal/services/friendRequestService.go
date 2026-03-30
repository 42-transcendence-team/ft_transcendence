package services

import (
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
)

type FriendRequestService struct {
	friendsRepo *repository.FriendRepository
	userRepo    *repository.UserRepository
}

func NewFriendRequestService(friendRepo *repository.FriendRepository, userRepo *repository.UserRepository) *FriendRequestService {
	return &FriendRequestService{
		friendsRepo: friendRepo,
		userRepo:    userRepo,
	}
}

func (s *FriendRequestService) SendRequest(receiverID uint, userID uint) (*models.FriendRequest, error) {

	// comprobar que no se mandan una solicitud a el mismo
	if receiverID == userID {
		return nil, appErr.NewBadRequest("you cannot send a friend request to yourself")
	}

	// comprobar que el receptor existe
	_, err := s.userRepo.FindById(receiverID)
	if err != nil {
		return nil, appErr.NewNotFound("user not found")
	}

	// comprobar que no son amigos
	areFriends, err := s.friendsRepo.AreFriends(userID, receiverID)
	if areFriends == true {
		return nil, appErr.NewConflict("users are already friends")
	}

	// comprobar que no hay bloqueo
	areBlock, err := s.friendsRepo.AreBlock(userID, receiverID)
	if areBlock == true {
		return nil, appErr.NewForbidden("friend request not allowed")
	}

	// comprobar que no hay solicitud pendiente
	isRequest, err := s.friendsRepo.IsRequest(userID, receiverID)
	if isRequest == true {
		return nil, appErr.NewConflict("friend requets already exists")
	}

	// crear la solicitud, stado pendiente
	newReqFriend, err := s.friendsRepo.SendFriendRequest(userID, receiverID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return newReqFriend, nil
}

func (s *FriendRequestService) ListOutgoingRequest(userID uint) ([]models.FriendRequest, error) {

	requests, err := s.friendsRepo.ListOutgoingRequests(userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return requests, nil
}

func (s *FriendRequestService) ListIncomingRequest(userID uint) ([]models.FriendRequest, error) {

	requests, err := s.friendsRepo.ListIncomingRequests(userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return requests, nil
}
