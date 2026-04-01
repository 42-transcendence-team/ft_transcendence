package repository

import (
	"backend/internal/models"
	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) CreateRoom(room *models.Room) (*models.Room, error) {
	return room, r.db.Create(room).Error
}

func (r *ChatRepository) CreateConversation(conv *models.Conversation) (*models.Conversation, error) {
	return conv, r.db.Create(conv).Error
}

func (r *ChatRepository) SaveMessage(msg *models.Message) (*models.Message, error) {
	return msg, r.db.Create(msg).Error
}

func (r *ChatRepository) GetMessagesByRoom(roomID uint, page, size int) ([]models.Message, error) {
	var msgs []models.Message
	err := r.db.Where("room_id = ?", roomID).
		Order("created_at DESC").
		Offset((page - 1) * size).
		Limit(size).
		Find(&msgs).Error
	return msgs, err
}

func (r *ChatRepository) GetMessagesByConversation(convID uint, page, size int) ([]models.Message, error) {
	var msgs []models.Message
	err := r.db.Where("conversation_id = ?", convID).
		Order("created_at DESC").
		Offset((page - 1) * size).
		Limit(size).
		Find(&msgs).Error
	return msgs, err
}
