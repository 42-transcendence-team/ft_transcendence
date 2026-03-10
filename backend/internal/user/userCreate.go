package user

import (
	"backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserCreate(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body struct {
			Login    string
			Email    string
			Password string
			Role     string

			Name     string
			Surname  string
			Birthday time.Time
		}
		if err := ctx.BindJSON(&body); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		user := models.User{
			Login:    body.Login,
			Email:    &body.Email,
			Password: body.Password,
			Role:     body.Role,
			Name:     body.Name,
			Surname:  body.Surname,
			Birthday: time.Now(),
		}
		if err := db.Table("users").Create(&user).Error; err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusCreated, user)
	}
}
