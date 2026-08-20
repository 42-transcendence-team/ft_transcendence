package models

import (
	"time"

	"gorm.io/gorm"
)

type ChatRoom struct {
    gorm.Model
    Name     string
    Private  bool          `gorm:"not null;default:false"`
    Members  []*User       `gorm:"many2many:room_users;"`
    Messages []ChatMessage `gorm:"foreignKey:RoomID"`
}

type ChatMessage struct {
    gorm.Model
    RoomID    uint       `gorm:"not null"`
    UserID    uint       `gorm:"not null"`
    Username  string     `gorm:"not null"`
    Content   string     `gorm:"not null"`
    Timestamp *time.Time `gorm:"not null"`
}

type RoomUser struct {
    ChatRoomID uint       `gorm:"primaryKey"`
    UserID     uint       `gorm:"primaryKey"`
    LastReadAt *time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

