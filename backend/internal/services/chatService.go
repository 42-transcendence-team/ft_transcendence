package services

import "backend/internal/repository"

type ChatService struct {
	chatRepo *repository.ChatRepository
}

func NewChatService(chatRepo *repository.ChatRepository) *ChatService {
	return &ChatService{chatRepo: chatRepo}
}
