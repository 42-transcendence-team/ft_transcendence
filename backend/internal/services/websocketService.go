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

type WebsocketService struct {
	chatRepo   *repository.WebsocketRepository
	userProv   UserProvider
	friendRepo *repository.FriendRepository
}

func NewWebsocketService(chatRepo *repository.WebsocketRepository, userProv UserProvider, friendRepo *repository.FriendRepository) *WebsocketService {
	return &WebsocketService{chatRepo: chatRepo, userProv: userProv, friendRepo: friendRepo}
}

func (s *WebsocketService) GetUser(userID uint) (*dto.ChatUserInfo, error) {
	return s.userProv.GetUserID(userID)
}

func (s *WebsocketService) CreateRoom(req *dto.CreateRoomRequest) (models.ChatRoom, error) {
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

func (s *WebsocketService) ListRooms(id uint) ([]models.ChatRoom, error) {
	return s.chatRepo.ListRooms(id)
}

func (s *WebsocketService) SaveMessage(message *models.ChatMessage) error {
	return s.chatRepo.CreateChatMessage(message)
}

func (s *WebsocketService) LoadRoomMessages(roomID, userID uint) ([]models.ChatMessage, error) {
	msgs, err := s.chatRepo.GetMessages(roomID)
	if err != nil {
		return nil, appErr.NewInternal(errors.New("failed to get messages"))
	}
	return msgs, nil
}

func (s *WebsocketService) GetRoomByID(roomID uint) (*models.ChatRoom, error) {
	return s.chatRepo.GetRoomByID(roomID)
}

func (s *WebsocketService) GetUserRooms(userID uint) ([]models.ChatRoom, error) {
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

func (s *WebsocketService) IsUserInRoom(roomID, userID uint) (bool, error) {
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

// CanSendToRoom comprueba que el remitente sea amigo de todos los demas
// miembros de la sala y que no haya un bloqueo entre ellos.
// Devuelve (ok, motivo) — si ok es false, motivo explica por que.
func (s *WebsocketService) CanSendToRoom(roomID uint, senderID uint) (bool, string) {
	room, err := s.GetRoomByID(roomID)
	if err != nil || room.ID == 0 {
		return false, "la sala no existe"
	}

	for _, member := range room.Members {
		if member.ID == senderID {
			continue
		}

		blocked, err := s.friendRepo.AreBlock(senderID, member.ID)
		if err != nil || blocked {
			return false, "no puedes enviar mensajes a un usuario bloqueado"
		}

		friends, err := s.friendRepo.AreFriends(senderID, member.ID)
		if err != nil || !friends {
			return false, "solo puedes enviar mensajes a amigos"
		}
	}

	return true, ""
}

// GetSharedRoom devuelve el ID de la sala compartida entre dos usuarios, si existe.
func (s *WebsocketService) GetSharedRoom(userID1 uint, userID2 uint) (uint, error) {
	room, err := s.chatRepo.GetSharedRoom(userID1, userID2)
	if err != nil {
		return 0, err
	}
	return room.ID, nil
}
