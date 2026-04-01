package migrations

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &models.User{},
        &models.Room{},
        &models.Conversation{},
        &models.Message{},
    )
}
