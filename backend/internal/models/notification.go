package models

import (
	"time"
)

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"userId"`
	Type      string    `gorm:"type:varchar(30);not null" json:"type"`
	Payload   string    `gorm:"type:text;not null" json:"payload"`
	IsRead    bool      `gorm:"not null;default:false" json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
}
