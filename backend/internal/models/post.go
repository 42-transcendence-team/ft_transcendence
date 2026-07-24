package models

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID uint `gorm:"primaryKey" json:"id"`

	UserID uint `gorm:"not null;index" json:"userId"`
	User   User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`

	Content   *string `gorm:"type:text" json:"content,omitempty"`
	ImagePath *string `gorm:"type:varchar(255)" json:"imagePath,omitempty"`
	FileName  *string `gorm:"type:varchar(255)" json:"fileName,omitempty"`

	Comments []Comment  `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"comments,omitempty"`
	Likes    []PostLike `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
