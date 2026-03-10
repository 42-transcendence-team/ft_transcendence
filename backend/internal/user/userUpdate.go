package user

import (
	"backend/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserUpdate(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		idstr := ctx.Param("id")
		id, err := strconv.Atoi(idstr)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}

		var body struct {
			Login    string `json:"login"`
			Email    string `json:"email"`
			Password string `json:"password"`
			Role     string `json:"role"`

			Name     string `json:"name"`
			Surname  string `json:"surname"`
			Birthday time.Time
		}

		if err := ctx.BindJSON(&body); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User

		if err := db.Table("users").First(&user, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}

		user.Login = body.Login
		user.Email = &body.Email
		user.Password = body.Password
		user.Role = body.Role
		user.Name = body.Name
		user.Surname = body.Surname
		user.Birthday = body.Birthday

		if err := db.Save(&user).Error; err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, user)
	}
}
