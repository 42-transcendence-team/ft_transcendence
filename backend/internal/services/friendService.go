package services

import (
	"backend/internal/repository"
)

type FriendService struct {
	FriendsRepo *repository.FriendRepository
	userRepo    *repository.UserRepository
}

func NewFriendService(friendRepo *repository.FriendRepository, userRepo *repository.UserRepository) *FriendService {
	return &FriendService{
		FriendsRepo: friendRepo,
		userRepo:    userRepo,
	}
}
