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

func (r *ChatRepository) CreateMessage(message *models.GeneralChat) error {
	return r.db.Create(message).Error
}

func (r *ChatRepository) GetMessages(roomID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.Where("room_id = ?", roomID).Order("created_at asc").Find(&messages).Error
	return messages, err
}

func (r *ChatRepository) CreateRoom(room *models.ChatRoom) error {
	return r.db.Create(room).Error
}

func (r *ChatRepository) ListRooms(userID uint) ([]models.ChatRoom, error) {
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

func (r *ChatRepository) CreateChatMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *ChatRepository) GetRoomByID(roomID uint) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.First(&room, roomID).Error
	return &room, err
}
//RoomID uint `json:"room_id" binding:"required"`
/*
ChatRoomID uint `gorm:"primaryKey"`
UserID     uint `gorm:"primaryKey"`
LastReadAt *time.Time`gorm:"not null;default:CURRENT_TIMESTAMP"`
*/
func (r *ChatRepository) UpdateLastTimeOpenChat(userID uint, roomID uint) error {
	return r.db.Model(&models.RoomUser{}).Where("chat_room_id = ? AND user_id = ?", roomID, userID).Update("last_read_at", time.Now()).Error
}

func (r *ChatRepository) GetMessagesNoRead(roomId uint , userID uint) uint {
	var unreadCount int64
	var roomUser models.RoomUser

	r.db.Where("chat_room_id = ? AND user_id = ?", roomId, userID).First(&roomUser)
	log.Printf("LastReadAt for user %d in room %d: %v", userID, roomId, roomUser.LastReadAt)
	r.db.Model(&models.ChatMessage{}).Where("room_id = ? AND created_at > ?", roomId, roomUser.LastReadAt).Count(&unreadCount)
	return uint(unreadCount)
}
