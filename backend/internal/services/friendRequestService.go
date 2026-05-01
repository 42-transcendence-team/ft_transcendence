package services

import (
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"fmt"

	"gorm.io/gorm"
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

// TODO: probablemete hay que sacarlo de auqui
func (s *FriendRequestService) ListFriends(userID uint) ([]models.Friendship, error) {

	requests, err := s.friendsRepo.ListFriends(userID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return requests, nil
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
	if err != nil {
		return nil, appErr.NewInternal(err)
	} else if areFriends == true {
		return nil, appErr.NewConflict("users are already friends")
	}

	// comprobar que no hay bloqueo
	areBlock, err := s.friendsRepo.AreBlock(userID, receiverID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	} else if areBlock == true {
		return nil, appErr.NewForbidden("friend request not allowed")
	}

	//mirar si ya esixte una solicitud pendiente
	hasPendingRequest, err := s.friendsRepo.HasPendingRequestBetweenUsers(userID, receiverID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}
	if hasPendingRequest {
		return nil, appErr.NewConflict("friend request already exists")
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

func (s *FriendRequestService) AcceptFriendRequest(userID uint, reqID uint) (*models.FriendRequest, error) {

	req, err := s.ValidatePendingRequestForReceiver(userID, reqID)
	if err != nil {
		return nil, err
	}

	// comprobar que no hay bloqueo
	areBlock, err := s.friendsRepo.AreBlock(userID, req.SenderID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	} else if areBlock == true {
		return nil, appErr.NewForbidden("Friend request not allowed")
	}

	// crear frindship
	// cambiar el estado e la requets a accepted
	err = s.friendsRepo.BuildFriendship(*req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("Friend request not found")
		}
		return nil, appErr.NewInternal(err)
	}

	req.Status = models.RelationAccepted
	// TODO: mandar notificacion

	return req, nil
}

func (s *FriendRequestService) RejectFriendRequest(userID uint, reqID uint) (*models.FriendRequest, error) {

	req, err := s.ValidatePendingRequestForReceiver(userID, reqID)
	if err != nil {
		return nil, err
	}

	// cambiar estado a rejected
	err = s.friendsRepo.RejectFriendRequest(reqID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("Friend request not found")
		}
		return nil, appErr.NewInternal(err)
	}

	req.Status = models.RelationRejected
	return req, nil
}

func (s *FriendRequestService) ValidatePendingRequestForReceiver(userID uint, reqID uint) (*models.FriendRequest, error) {

	// miramos si existe la request
	req, err := s.friendsRepo.GetReqByID(reqID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound("Friend request not found")
		}
		return nil, appErr.NewInternal(err)
	}

	// pasan user desde el handler que ya es el usuario autenticado
	// el usuario autenticado tiene que ser el reciver
	if req.ReceiverID != userID {
		return nil, appErr.NewForbidden("You are not the receiver of the request")
	}

	// mirar el estado de la request , que este en pending
	switch req.Status {
	case models.RelationPending:
		// Ok , continue
	case models.RelationAccepted:
		return nil, appErr.NewConflict("Friend request already accepted")
	case models.RelationRejected:
		return nil, appErr.NewConflict("Friend request already rejected")
	default:
		return nil, appErr.NewInternal(fmt.Errorf("invalid friend request status: %v", req.Status))
	}

	// comprobar que no son amigos
	areFriends, err := s.friendsRepo.AreFriends(userID, req.SenderID)
	if err != nil {
		return nil, appErr.NewInternal(err)
	} else if areFriends == true {
		return nil, appErr.NewConflict("Users are already friends")
	}

	return req, nil
}

// TODO: probablemnte hay que sacarlo de aqui
func (s *FriendRequestService) DeleteFriend(userID uint, friendID uint) error {

	// comprobar que no son amigos
	areFriends, err := s.friendsRepo.AreFriends(userID, friendID)
	if err != nil {
		return appErr.NewInternal(err)
	} else if areFriends == false {
		return appErr.NewNotFound("you cant delete a friend who is not your friend")
	}

	err = s.friendsRepo.DeleteFriendship(userID, friendID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return appErr.NewNotFound("Friendship not found")
		}
		return appErr.NewInternal(err)
	}

	return nil
}
