package db

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	err := db.SetupJoinTable(&models.ChatRoom{}, "Members", &models.RoomUser{})
	if err != nil {
		return err
	}

	return db.AutoMigrate(
		&models.User{},
		&models.ChatRoom{},
		&models.ChatMessage{},
		&models.RoomUser{},
		&models.FriendRequest{},
		&models.Block{},
		&models.Friendship{},
		&models.Post{},
		&models.Comment{},
		&models.PostLike{},
		&models.Notification{},
	)
}
