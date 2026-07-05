package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"backend/internal/storage"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type UserHandler struct {
	UserService  *services.UserService
	Redis        *redis.Client
	ImageStorage *storage.ImageStorage
}

func NewUserHandler(
	userService *services.UserService,
	redisClient *redis.Client,
	imageStorage *storage.ImageStorage,
) *UserHandler {
	return &UserHandler{
		UserService:  userService,
		Redis:        redisClient,
		ImageStorage: imageStorage,
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

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
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

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
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

func (h *UserHandler) UpdateAvatar(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			c.Error(appErr.NewValidation(map[string]string{
				"image": "required",
			}))
		} else {
			c.Error(appErr.NewBadRequest("invalid_image_upload"))
		}

		c.Abort()
		return
	}

	newAvatarPath, err := h.ImageStorage.SaveAvatarImage(file)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	previousAvatarPath, err := h.UserService.UpdateAvatar(
		userID,
		newAvatarPath,
	)
	if err != nil {
		// Si PostgreSQL no se actualiza, retiramos el archivo recién creado.
		_ = h.ImageStorage.Delete(newAvatarPath)

		c.Error(err)
		c.Abort()
		return
	}

	/*
		La base de datos ya apunta al avatar nuevo. El borrado del archivo
		anterior es una limpieza secundaria y no debe hacer creer al cliente
		que la actualización completa ha fallado.
	*/
	if previousAvatarPath != nil {
		if err := h.ImageStorage.Delete(*previousAvatarPath); err != nil {
			log.Printf(
				"could not delete previous avatar %q: %v",
				*previousAvatarPath,
				err,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "avatar updated",
		"data": gin.H{
			"avatarPath": newAvatarPath,
		},
	})
}

func (h *UserHandler) DeleteAvatar(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	previousAvatarPath, err := h.UserService.DeleteAvatar(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if previousAvatarPath != nil {
		if err := h.ImageStorage.Delete(*previousAvatarPath); err != nil {
			log.Printf(
				"could not delete avatar %q: %v",
				*previousAvatarPath,
				err,
			)
		}
	}

	c.Status(http.StatusNoContent)
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
			"id":         user.ID,
			"login":      user.Login,
			"email":      user.Email,
			"name":       user.Name,
			"surname":    user.Surname,
			"avatarPath": user.AvatarPath,
		},
	})
}
