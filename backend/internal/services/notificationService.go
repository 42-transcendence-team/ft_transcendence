package services

import (
	"backend/internal/dto"
	"backend/internal/models"
	"backend/internal/repository"
	"encoding/json"
	"log"

	ws "backend/internal/websocket"
)

type NotificationService struct {
	repo *repository.NotificationRepository
	hub  *ws.Hub
}

func NewNotificationService(repo *repository.NotificationRepository, hub *ws.Hub) *NotificationService {
	return &NotificationService{
		repo: repo,
		hub:  hub,
	}
}

func (s *NotificationService) ListUnread(userID uint) ([]models.Notification, error) {
	return s.repo.ListUnreadByUserID(userID)
}

func (s *NotificationService) MarkAsRead(notifID uint, userID uint) error {
	return s.repo.MarkAsRead(notifID, userID)
}

func (s *NotificationService) Notify(userID uint, notifType string, payload json.RawMessage) (*models.Notification, error) {
	notif := &models.Notification{
		UserID:  userID,
		Type:    notifType,
		Payload: string(payload),
	}

	if err := s.repo.Create(notif); err != nil {
		return nil, err
	}

	message, err := json.Marshal(dto.NotificationMessage{
		ID:      &notif.ID,
		Type:    notifType,
		Payload: payload,
	})
	if err != nil {
		log.Printf("Error marshaling notification for WS: %v", err)
		return notif, nil
	}

	s.hub.SendMessagesToUser(userID, message)

	return notif, nil
}
