package models

import (
	"time"

	"gorm.io/gorm"
)

// Mirar cuales deben ser not null.
type Channel struct {
	ID      string `gorm:"primaryKey"`
	Name    string
	Type    string `gorm:"type:varchar(10)"` // "room" or "dm" --> puede que sea buena idea utilizar otro tipo de codificacion pero bueno de momento asi esta bien
	OwnerID uint
	gorm.Model
}

type Membership struct {
	UserID    uint       `gorm:"primaryKey"`
	ChannelID string     `gorm:"primaryKey"`
	BannedAt  *time.Time
}

type ChatMessage struct {
	ID        uint   `gorm:"primaryKey"`
	ChannelID string `gorm:"index"`
	SenderID  uint
	Content   string
	EditedAt  *time.Time
	gorm.Model // Includes DeletedAt for soft delete , es una tecnica nativa del orm para hacer que el usuario no veo los mensajes, pero seguir teniendolos en la base de datos
}

type Report struct {
	ID         uint   `gorm:"primaryKey"`
	TargetType string // "message" or "user"
	TargetID   uint
	ReporterID uint
	Reason     string
	gorm.Model
}
