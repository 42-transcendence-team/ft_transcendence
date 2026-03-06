package user

import (
	"backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserIndex(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var users []models.User
		if err := db.Table("users").Find(&users).Error; err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusCreated, users)
	}
}
