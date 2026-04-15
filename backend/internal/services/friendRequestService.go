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

func (s *FriendRequestService) AcceptFriendRequest(userID uint, senderID uint) error {

	// miro si hay peticion de amistad para mi
	isReq, err := s.friendsRepo.IsRequestForMe(senderID, userID)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if isReq != true {
		return appErr.NewForbidden("There are not a friend request for you")
	}

	// mirar el estado de la request , que este en pending
	status, err := s.friendsRepo.GetReqStatus(senderID, userID)
	if status == models.RelationAccepted {
		return appErr.NewConflict("ya fue aceptada la solicitud son amigos")
	}
	if status == models.RelationRejected {
		return appErr.NewForbidden("ya rechazaste la peticion")
	}
	if status != models.RelationPending {
		return appErr.NewForbidden("algo no va bien")
	}

	// el usuario autenticado tiene que ser el reciver
	// pasan user desde el handler que ya es el usuario autenticado

	// comprobar que no hay bloqueo
	areBlock, err := s.friendsRepo.AreBlock(userID, senderID)
	if areBlock == true {
		return appErr.NewForbidden("friend request not allowed")
	}

	// comprobar que no son amigos
	areFriends, err := s.friendsRepo.AreFriends(userID, senderID)
	if areFriends == true {
		return appErr.NewConflict("users are already friends")
	}

	// cambiar el estado e la requets a acepted
	err = s.friendsRepo.ChangeReqStatus(models.RelationAccepted, senderID, userID)
	if err != nil {
		return appErr.NewForbidden("error en la db o no se encontro la request para cambair estado")
	}

	// crear frindship
	err = s.friendsRepo.CreateFriendship(userID, senderID)
	if err != nil {
		return appErr.NewInternal(err)
	}
	// mandar notificacion

	return nil
}

func (s *FriendRequestService) RejectFriendRequest(userID uint, senderID uint) error {
	// miro si hay peticion de amistad para mi
	isReq, err := s.friendsRepo.IsRequestForMe(senderID, userID)
	if err != nil {
		return appErr.NewInternal(err)
	}
	if isReq != true {
		return appErr.NewForbidden("There are not a friend request for you")
	}

	// mirar el estado de la request , que este en pending

	// el usuario autenticado tiene que ser el reciver

	// cambiar estado a rejected

	return nil
}
