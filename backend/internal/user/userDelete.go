package user

import (
	"backend/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserDelete(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		idstr := ctx.Param("id")
		id, err := strconv.Atoi(idstr)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := db.Table("users").Delete(&user, id).Error; err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusAccepted, user)
	}
}
