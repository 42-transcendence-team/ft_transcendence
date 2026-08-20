package models

import (
	"time"

	"gorm.io/gorm"
)

type GeneralChat struct {
	gorm.Model
	Message   string     `json:"message"`
	UserID    uint       `json:"user_id"`
	Username  string     `json:"username"`
	Timestamp *time.Time `json:"timestamp,omitempty"`
}
