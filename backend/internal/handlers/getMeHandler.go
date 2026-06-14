package handlers

import (
	"backend/config"
	//"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"errors"
	//"net/http"
	//"time"

	"github.com/gin-gonic/gin"
)

type getMeHandler struct {
	AuthService *services.AuthService
	cfg         *config.Config
}

func NewGetMeHandler(authService *services.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
		cfg:         cfg,
	}
}

func (h *AuthHandler) Whoami(c *gin.Context) {

	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(200, gin.H{
			"authenticated": false,
			"user": gin.H{
				"id":    -666,
				"login": nil,
				"email": nil,
			},
		})
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewInternal(errors.New("invalid userID type in context")))
		c.Abort()
		return
	}

	user, err := h.AuthService.GetUserById(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	// TODO: hay q ver como se mandan los msg al front y que necesita saber
	c.JSON(200, gin.H{
		"authenticated": true,
		"user": gin.H{
			"id":    user.ID,
			"login": user.Login,
			"email": user.Email,
		},
	})
}
