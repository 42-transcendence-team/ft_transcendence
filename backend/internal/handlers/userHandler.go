package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"net/http"
	"strconv"
	"time"
)

type UserHandler struct {
	UserService           *services.UserService
	Redis                 *redis.Client
	AdvancedSearchService *services.AdvancedSearchService
}

func NewUserHandler(userService *services.UserService, redisClient *redis.Client, advancedSearchService *services.AdvancedSearchService) *UserHandler {
	return &UserHandler{
		UserService:           userService,
		Redis:                 redisClient,
		AdvancedSearchService: advancedSearchService,
	}
}

// TODO: borrar luego esta funcion
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

func (h *UserHandler) AdvancedSearch(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	query, err := parseSearchQuery(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	response, err := h.AdvancedSearchService.SearchUsers(userID, query)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, response)
}

func parseSearchQuery(c *gin.Context) (*dto.UserFilter, error) {

	q := c.Query("q")
	sort := c.Query("sort")
	pageStr := c.Query("page")
	page := 1
	if pageStr != "" {
		pageNb, err := strconv.Atoi(pageStr)
		if err != nil {
			return nil, appErr.NewValidation(map[string]string{
				"page": "must be a valid number",
			})
		}
		if pageNb < 1 {
			return nil, appErr.NewValidation(map[string]string{
				"page": "must be greater than 0",
			})
		}
		page = pageNb

	}

	limitStr := c.Query("limit")
	limit := 5
	if limitStr != "" {
		limitNb, err := strconv.Atoi(limitStr)
		if err != nil {
			return nil, appErr.NewValidation(map[string]string{
				"limit": "must be a valid number",
			})
		}
		if limitNb < 1 || limitNb > 50 {
			return nil, appErr.NewValidation(map[string]string{
				"limit": "must be greater than 0 && lower than 50",
			})
		}
		limit = limitNb
	}

	return (&dto.UserFilter{
		Q:     q,
		Sort:  sort,
		Page:  page,
		Limit: limit,
	}), nil
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
