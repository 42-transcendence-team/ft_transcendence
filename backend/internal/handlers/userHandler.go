package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	UserService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{UserService: userService}
}

func (h *UserHandler) Filter(c *gin.Context) {

	var filter dto.UserFilter

	err := c.ShouldBindQuery(&filter)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	users, err := h.UserService.Filter(filter)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) Delete(c *gin.Context) {
	var filter dto.UserFilter

	err := c.ShouldBindJSON(&filter)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	err = h.UserService.Delete(filter)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func (h *UserHandler) Modify(c *gin.Context) {
	var user dto.UserFilter

	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	err = h.UserService.Modify(user)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User modified successfully"})
}
