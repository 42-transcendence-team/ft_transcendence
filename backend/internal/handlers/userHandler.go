package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	UserService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{UserService: userService}
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

func (h *UserHandler) GetSettings(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	settings, err := h.UserService.GetSettings(userIDValue.(uint))
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, settings)
}

func (h *UserHandler) RemoveAccount(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}
	var request dto.UserDelete

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.Error(appErr.NewBadRequest(err.Error())) // TODO - Revisar error que muestra, ahora mismo lo que devuelve el DTO
		c.Abort()
		return
	}

	request.Id = userIDValue.(uint)

	err = h.UserService.RemoveAccount(request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User removed successfully"})
}

func (h *UserHandler) UpdatePersonalData(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	var req dto.UserModifyData

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	request := dto.ModifyInputData{
		Code:    req.Code,
		Name:    req.Name,
		Surname: req.Surname,
	}

	if req.Birthday != nil {
		birthday, err := time.Parse("2006-01-02", *req.Birthday)
		if err != nil {
			c.Error(appErr.NewValidation(map[string]string{
				"birthday": "invalid_format",
			}))
			c.Abort()
			return
		}
		request.Birthday = &birthday
	}

	err = h.UserService.ModifyData(userIDValue.(uint), request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User modified successfully"})
}

func (h *UserHandler) UpdateEmail(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	var req dto.UserModifyEmail

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.Error(appErr.NewBadRequest(err.Error())) // TODO - Revisar error que muestra, ahora mismo lo que devuelve el DTO
		c.Abort()
		return
	}

	request := dto.ModifyInputEmail{
		Code:        req.Code,
		Email:       req.Email,
		VerifyEmail: req.VerifyEmail,
	}

	err = h.UserService.ModifyEmail(userIDValue.(uint), request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User modified successfully"})
}

func (h *UserHandler) UpdatePassword(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	var req dto.UserModifyPass

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.Error(appErr.NewBadRequest(err.Error())) // TODO - Revisar error que muestra, ahora mismo lo que devuelve el DTO
		c.Abort()
		return
	}

	request := dto.ModifyInputPass{
		Code:             req.Code,
		Password:         req.Password,
		VerifyPassword:   req.VerifyPassword,
		PreviousPassword: req.PreviousPassword,
	}

	err = h.UserService.ModifyPass(userIDValue.(uint), request)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User modified successfully"})
}
