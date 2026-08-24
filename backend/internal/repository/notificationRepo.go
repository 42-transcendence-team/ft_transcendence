package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type NotificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{
		db: db,
	}
}

func (r *NotificationRepository) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

func (r *NotificationRepository) ListUnreadByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification

	err := r.db.
		Where("user_id = ? AND is_read = ?", userID, false).
		Order("created_at DESC").
		Find(&notifications).Error

	return notifications, err
}

func (r *NotificationRepository) MarkAsRead(notificationID uint, userID uint) error {
	result := r.db.
		Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *NotificationRepository) MarkAllAsRead(userID uint) error {
	return r.db.
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error
}
