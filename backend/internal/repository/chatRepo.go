package repository

import (
	"backend/internal/models"
	"log"
	"time"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

// func (r *ChatRepository) CreateMessage(message *models.GeneralChat) error {
// 	return r.db.Create(message).Error
// }

func (r *ChatRepository) GetRoomByID(roomID uint) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.First(&room, roomID).Error
	return &room, err
}

func (r *ChatRepository) UpdateLastTimeOpenChat(userID uint, roomID uint) error {
	return r.db.Model(&models.RoomUser{}).Where("chat_room_id = ? AND user_id = ?", roomID, userID).Update("last_read_at", time.Now()).Error
}

func (r *ChatRepository) GetMessagesNoRead(roomId uint, userID uint) uint {
	var unreadCount int64
	var roomUser models.RoomUser

	r.db.Where("chat_room_id = ? AND user_id = ?", roomId, userID).First(&roomUser)
	log.Printf("LastReadAt for user %d in room %d: %v", userID, roomId, roomUser.LastReadAt)
	r.db.Model(&models.ChatMessage{}).Where("room_id = ? AND created_at > ?", roomId, roomUser.LastReadAt).Count(&unreadCount)
	return uint(unreadCount)
}
