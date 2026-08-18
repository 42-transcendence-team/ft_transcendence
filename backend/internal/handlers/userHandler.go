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
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type UserHandler struct {
	UserService           *services.UserService
	Redis                 *redis.Client
	ImageStorage          *storage.ImageStorage
	AdvancedSearchService *services.AdvancedSearchService
}

func NewUserHandler(
	userService *services.UserService,
	redisClient *redis.Client,
	imageStorage *storage.ImageStorage,
	advancedSearchService *services.AdvancedSearchService,
) *UserHandler {
	return &UserHandler{
		UserService:           userService,
		Redis:                 redisClient,
		ImageStorage:          imageStorage,
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

	relationsStr := c.Query("relations")
	relations := strings.Split(relationsStr, ",")
	cleanRelations := []string{}
	for _, relation := range relations {
		trimmed := strings.TrimSpace(relation)

		if trimmed != "" {
			cleanRelations = append(cleanRelations, trimmed)
		}
	}

	return (&dto.UserFilter{
		Q:         q,
		Relations: relations,
		Sort:      sort,
		Page:      page,
		Limit:     limit,
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

// UpdateAvatar guarda el nuevo avatar y actualiza su ruta en la base de datos.
// Si la actualización falla, elimina el archivo recién creado para evitar residuos.
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

// DeleteAvatar elimina la ruta del avatar personalizado y después intenta
// retirar el archivo almacenado. La respuesta no falla si esa limpieza secundaria falla.
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

// UpdateBanner guarda el nuevo banner y actualiza su ruta en la base de datos.
// Si la actualización falla, elimina el archivo recién creado para evitar residuos.
func (h *UserHandler) UpdateBanner(c *gin.Context) {
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

	newBannerPath, err := h.ImageStorage.SaveBannerImage(file)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	previousBannerPath, err := h.UserService.UpdateBanner(
		userID,
		newBannerPath,
	)
	if err != nil {
		// Si PostgreSQL no se actualiza, retiramos el archivo recién creado.
		_ = h.ImageStorage.Delete(newBannerPath)

		c.Error(err)
		c.Abort()
		return
	}

	/*
		La base de datos ya apunta al banner nuevo. El borrado del archivo
		anterior es una limpieza secundaria y no debe hacer creer al cliente
		que la actualización completa ha fallado.
	*/
	if previousBannerPath != nil {
		if err := h.ImageStorage.Delete(*previousBannerPath); err != nil {
			log.Printf(
				"could not delete previous banner %q: %v",
				*previousBannerPath,
				err,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "banner updated",
		"data": gin.H{
			"bannerPath": newBannerPath,
		},
	})
}

// DeleteBanner elimina la ruta del banner personalizado y después intenta
// retirar el archivo almacenado. La respuesta no falla si esa limpieza secundaria falla.
func (h *UserHandler) DeleteBanner(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	previousBannerPath, err := h.UserService.DeleteBanner(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if previousBannerPath != nil {
		if err := h.ImageStorage.Delete(*previousBannerPath); err != nil {
			log.Printf(
				"could not delete banner %q: %v",
				*previousBannerPath,
				err,
			)
		}
	}

	c.Status(http.StatusNoContent)
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	login := c.Param("login")
	noIncrement := c.Query("no_increment") == "true"
	user, err := h.UserService.GetUserByLogin(login)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	callerID, exists := c.Get("userID") //evitamos q se sumen visitas si eres el usuario del perfil
	if exists && callerID.(uint) == user.ID {
		noIncrement = true
	}
	ctx := c.Request.Context()

	isOnline, err := h.Redis.
		SIsMember(ctx, "online_users", user.ID).
		Result()
	if err != nil {
		log.Printf(
			"could not read online status for user %d: %v",
			user.ID,
			err,
		)
		isOnline = false
	}

	visitKey := fmt.Sprintf("visits:%d", user.ID)
	var visits int64

	if noIncrement { //sacamos el valor sin sumar numero de visitas sin sumar
		visitsStr, err := h.Redis.Get(ctx, visitKey).Result()
		if err == redis.Nil { // La clave aún no existe
			visits = 0
		} else if err != nil {
			log.Printf("could not read visits for user %d: %v", user.ID, err)
			visits = 0
		} else {
			visits, _ = strconv.ParseInt(visitsStr, 10, 64)
		}
	} else { //se suma 1 como se hacia antes
		visits, err = h.Redis.Incr(ctx, visitKey).Result()
		if err != nil {
			log.Printf("could not update visits for user %d: %v", user.ID, err)
			visits = 0
		}
	}

	profile := dto.UserProfileResponse{
		ID:         user.ID,
		Login:      user.Login,
		Name:       user.Name,
		Surname:    user.Surname,
		AvatarPath: user.AvatarPath,
		BannerPath: user.BannerPath,
		Status:     user.State,
		IsOnline:   isOnline,
		Visits:     visits,
	}

	c.JSON(http.StatusOK, gin.H{
		"data": profile,
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
			"bannerPath": user.BannerPath,
		},
	})
}

func (h *UserHandler) GetPresence(c *gin.Context) {
	login := c.Param("login")

	user, err := h.UserService.GetUserByLogin(login)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	isOnline, err := h.Redis.
		SIsMember(
			c.Request.Context(),
			"online_users",
			user.ID,
		).
		Result()
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"isOnline": isOnline,
		},
	})
}
