package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
)

type ChatService struct {
	chatRepo *repository.ChatRepository
}

func NewChatService(chatRepo *repository.ChatRepository) *ChatService {
	return &ChatService{chatRepo: chatRepo}
}

func (s *ChatService) CreateRoom(name string) (*models.Room, error) {
	return s.chatRepo.CreateRoom(&models.Room{Name: name})
}

func (s *ChatService) CreateConversation(user1ID, user2ID uint) (*models.Conversation, error) {
	if user1ID == user2ID {
		return nil, errors.New("self-conversation not allowed")
	}
	return s.chatRepo.CreateConversation(&models.Conversation{User1ID: user1ID, User2ID: user2ID})
}

func (s *ChatService) SaveMessage(msg *models.Message) (*models.Message, error) {
	if (msg.RoomID == nil) == (msg.ConversationID == nil) {
		return nil, errors.New("XOR(RoomID, ConversationID) violated")
	}
	return s.chatRepo.SaveMessage(msg)
}

func (s *ChatService) GetRoomHistory(roomID uint, page, size int) ([]models.Message, error) {
	return s.chatRepo.GetMessagesByRoom(roomID, page, size)
}

func (s *ChatService) GetDMHistory(convID uint, page, size int) ([]models.Message, error) {
	return s.chatRepo.GetMessagesByConversation(convID, page, size)
}
