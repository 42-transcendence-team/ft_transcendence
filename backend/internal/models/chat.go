package models

import "time"

type Conversation struct {
	ID        uint      `gorm:"primaryKey"`
	User1ID   uint      `gorm:"not null;index"`
	User2ID   uint      `gorm:"not null;index"`
	CreatedAt time.Time
	Messages  []Message `gorm:"foreignKey:ConversationID"`
}

type Room struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"not null;unique"`
	CreatedAt time.Time
	Messages  []Message `gorm:"foreignKey:RoomID"`
}

type Message struct {
	ID             uint       `gorm:"primaryKey"`
	SenderID       uint       `gorm:"not null;index"`
	ReceiverID     *uint      // nil si es Room
	RoomID         *uint      `gorm:"index"` // nil si es DM
	ConversationID *uint      `gorm:"index"` // nil si es Room
	Body           string     `gorm:"not null"`
	Status         string     `gorm:"default:'sent'"` // enviado o recibidoleido o 
	CreatedAt      time.Time
}
