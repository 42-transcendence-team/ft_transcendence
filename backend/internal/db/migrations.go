package db

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.FriendRequest{},
		&models.Block{},
		&models.Friendship{},
		&models.Post{},
		&models.Comment{},
	)
}
