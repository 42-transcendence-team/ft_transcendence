package repository

import (
	"backend/internal/models"
	"gorm.io/gorm"
)

type WebsocketRepository struct {
	db *gorm.DB
}

func NewWebsocketRepository(db *gorm.DB) *WebsocketRepository {
	return &WebsocketRepository{db: db}
}

func (r *WebsocketRepository) CreateMessage(message *models.GeneralChat) error {
	return r.db.Create(message).Error
}

func (r *WebsocketRepository) GetMessages(roomID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.Where("room_id = ?", roomID).Order("created_at asc").Find(&messages).Error
	return messages, err
}

func (r *WebsocketRepository) CreateRoom(room *models.ChatRoom) error {
	return r.db.Create(room).Error
}

func (r *WebsocketRepository) ListRooms(userID uint) ([]models.ChatRoom, error) {
	var rooms []models.ChatRoom

    err := r.db.
        Joins("JOIN room_users ON room_users.chat_room_id = chat_rooms.id").
        Where("room_users.user_id = ? AND chat_rooms.deleted_at IS NULL", userID).
        Preload("Members").
		Find(&rooms).Error

    return rooms, err	
	// var rooms []models.ChatRoom
	// err := r.db.Preload("Members").Find(&rooms).Error
	// return rooms, err
}

func (r *WebsocketRepository) CreateChatMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *WebsocketRepository) GetRoomByID(roomID uint) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.First(&room, roomID).Error
	return &room, err
}
