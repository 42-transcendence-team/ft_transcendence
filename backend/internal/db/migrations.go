package db

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Channel{},
		&models.Membership{},
		&models.ChatMessage{},
		&models.Report{},
	)
}
