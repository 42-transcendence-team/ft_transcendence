package services

import (
	"backend/internal/repository"
	appErr "backend/internal/errors"
	"errors"
)

type ChatService struct {
	chatRepo *repository.ChatRepository
	userProv UserProvider
}

func NewChatService(chatRepo *repository.ChatRepository, userProv UserProvider) *ChatService {
	return &ChatService{chatRepo: chatRepo, userProv: userProv}
}

func (s *ChatService) UpdateLastTimeOpenChat(userID uint, roomID uint) error {
	err := s.chatRepo.UpdateLastTimeOpenChat(userID, roomID)
	if (err != nil) {
		return appErr.NewInternal(errors.New("failed to update last time open chat"))
	}
	return err
}

func (s *ChatService)GetMessageNotRead(roomId uint, userID uint) uint {
	return s.chatRepo.GetMessagesNoRead(roomId, userID)
}
