package models

import "time"

const (
	PostReactionDislike int8 = -1
	PostReactionLike    int8 = 1
)

// PostLike representa la reacción de un usuario a un post.
// Se mantiene el nombre para conservar la tabla post_likes existente.
type PostLike struct {
	ID uint `gorm:"primaryKey" json:"id"`

	PostID uint `gorm:"not null;index;uniqueIndex:idx_post_likes_post_user" json:"postId"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	UserID uint `gorm:"not null;index;uniqueIndex:idx_post_likes_post_user" json:"userId"`
	User   User `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	// 1 representa like y -1 representa dislike.
	Reaction int8 `gorm:"type:smallint;not null;default:1;check:reaction IN (-1, 1)" json:"reaction"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
