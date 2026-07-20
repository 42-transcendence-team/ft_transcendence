package models

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID uint `gorm:"primaryKey" json:"id"`

	PostID uint `gorm:"not null;index" json:"postId"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	UserID uint `gorm:"not null;index" json:"userId"`
	User   User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`

	Content string `gorm:"type:text;not null" json:"content"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
