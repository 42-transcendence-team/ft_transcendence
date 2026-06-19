package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"

	"gorm.io/gorm"
)

type UserProvider interface {
	GetUserID(userID uint) (*dto.ChatUserInfo, error)
}

type ChatService struct {
	chatRepo *repository.ChatRepository
	userProv UserProvider
}

func NewChatService(chatRepo *repository.ChatRepository, userProv UserProvider) *ChatService {
	return &ChatService{chatRepo: chatRepo, userProv: userProv}
}

func (s *ChatService) GetUser(userID uint) (*dto.ChatUserInfo, error) {
	return s.userProv.GetUserID(userID)
}

func (s *ChatService) CreateRoom(req *dto.CreateRoomRequest) (models.ChatRoom, error) {
	members := make([]*models.User, 0, len(req.Users))

	for _, userID := range req.Users {
		if _, err := s.userProv.GetUserID(userID); err != nil {
			return models.ChatRoom{}, err
		}

		members = append(members, &models.User{
			Model: gorm.Model{ID: userID},
		})
	}

	room := models.ChatRoom{
		Name:    req.Name,
		Private: req.Private,
		Members: members,
	}

	if err := s.chatRepo.CreateRoom(&room); err != nil {
		return models.ChatRoom{}, err
	}

	return room, nil
}

func (s *ChatService) ListRooms(id uint) ([]models.ChatRoom, error) {
	return s.chatRepo.ListRooms(id)
}

func (s *ChatService) SaveMessage(message *models.ChatMessage) error {
	return s.chatRepo.CreateChatMessage(message)
}

func (s *ChatService) LoadRoomMessages(roomID, userID uint) ([]models.ChatMessage, error) {
	msgs, err := s.chatRepo.GetMessages(roomID)
	if err != nil {
		return nil, appErr.NewInternal(errors.New("failed to get messages"))
	}
	return msgs, nil
}

func (s *ChatService) GetRoomByID(roomID uint) (*models.ChatRoom, error) {
	return s.chatRepo.GetRoomByID(roomID)
}

func (s *ChatService) GetUserRooms(userID uint) ([]models.ChatRoom, error) {
	rooms, err := s.chatRepo.ListRooms(userID)
	if err != nil {
		return nil, appErr.NewInternal(errors.New("failed to list rooms"))
	}

	userRooms := make([]models.ChatRoom, 0)
	for _, room := range rooms {
		for _, member := range room.Members {
			if member.ID == userID {
				userRooms = append(userRooms, room)
				break
			}
		}
	}

	return userRooms, nil
}

func (s *ChatService) IsUserInRoom(roomID, userID uint) (bool, error) {
	room, err := s.GetRoomByID(roomID)
	if err != nil {
		return false, err
	}

	for _, member := range room.Members {
		if member.ID == userID {
			return true, nil
		}
	}

	return false, nil
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
