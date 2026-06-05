package models

import "time"

type PostLike struct {
	ID uint `gorm:"primaryKey" json:"id"`

	PostID uint `gorm:"not null;index;uniqueIndex:idx_post_likes_post_user" json:"postId"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	UserID uint `gorm:"not null;index;uniqueIndex:idx_post_likes_post_user" json:"userId"`
	User   User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time `json:"createdAt"`
}
