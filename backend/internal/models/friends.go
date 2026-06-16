package models

import (
	"time"
)

type RelationStatus string

const (
	RelationPending  RelationStatus = "pending"
	RelationAccepted RelationStatus = "accepted"
	RelationRejected RelationStatus = "rejected"
)

type FriendRequest struct {
	ID         uint           `gorm:"primaryKey"`
	SenderID   uint           `gorm:"not null;index"`
	ReceiverID uint           `gorm:"not null;index"`
	Status     RelationStatus `gorm:"type:varchar(20);not null;default:'pending'"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type Block struct {
	ID        uint `gorm:"primaryKey"`
	BlockerID uint `gorm:"not null;uniqueIndex:idx_blocker_blocked"`
	BlockedID uint `gorm:"not null;uniqueIndex:idx_blocker_blocked"`
	CreatedAt time.Time
}

type Friendship struct {
	ID        uint `gorm:"primaryKey"`
	User1ID   uint `gorm:"not null;uniqueIndex:idx_friendship"`
	User2ID   uint `gorm:"not null;uniqueIndex:idx_friendship"`
	CreatedAt time.Time
}
