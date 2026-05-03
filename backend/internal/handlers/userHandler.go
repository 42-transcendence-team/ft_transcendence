package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type UserHandler struct {
	UserService *services.UserService
	Redis       *redis.Client
}

func NewUserHandler(userService *services.UserService, redisClient *redis.Client) *UserHandler {
	return &UserHandler{
		UserService: userService,
		Redis:       redisClient,
	}
}

func (h *UserHandler) Filter(c *gin.Context) {
	var request dto.UserFilter

	err := c.ShouldBindQuery(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	users, err := h.UserService.Filter(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) Delete(c *gin.Context) {
	var request dto.UserDelete

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	err = h.UserService.Delete(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func (h *UserHandler) Modify(c *gin.Context) {
	var request dto.UserModify

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	err = h.UserService.Modify(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User modified successfully"})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// /users/profile/pepe -> pepe
	loginParam := c.Param("login")

	user, err := h.UserService.GetUserByLogin(loginParam)
	if err != nil {
		c.JSON(404, gin.H{"error": "Usuario no encontrado"})
		return
	}

	ctx := c.Request.Context()

	isOnline, _ := h.Redis.SIsMember(ctx, "online_users", user.ID).Result()

	visitKey := fmt.Sprintf("visits:%d", user.ID)
	visits, _ := h.Redis.Incr(ctx, visitKey).Result()

	c.JSON(200, gin.H{
		"id":       user.ID,
		"login":    user.Login,
		"email":    user.Email,
		"name":     user.Name,
		"surname":  user.Surname,
		"isOnline": isOnline,
		"visits":   visits,
	})
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado. Sesión inválida."})
		return
	}

	id := userID.(uint)
	user, err := h.UserService.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"user": gin.H{
			"id":      user.ID,
			"login":   user.Login,
			"email":   user.Email,
			"name":    user.Name,
			"surname": user.Surname,
		},
	})
}
