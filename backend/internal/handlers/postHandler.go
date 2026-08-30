// El handler es la capa HTTP del backend.
// Su responsabilidad es recibir la petición, leer los datos necesarios
// del contexto de Gin, validar la entrada básica, llamar al service
// correspondiente y devolver una respuesta JSON con el código HTTP adecuado.
// No debe contener lógica de negocio compleja ni acceder directamente a la base de datos.

package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"backend/internal/storage"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"path"
	"strconv"
	"strings"
	"unicode"

	ws "backend/internal/websocket"

	"github.com/gin-gonic/gin"
)

const (
	defaultPostListPage  = 1
	defaultPostListLimit = 20
	maxPostListLimit     = 50
)

type PostHandler struct {
	PostService         *services.PostService
	ImageStorage        *storage.ImageStorage
	hub                 *ws.Hub
	friendService       *services.FriendRequestService
	notificationService *services.NotificationService
}

func NewPostHandler(
	friendService *services.FriendRequestService,
	hub *ws.Hub,
	postService *services.PostService,
	imageStorage *storage.ImageStorage,
	notificationService *services.NotificationService,
) *PostHandler {
	return &PostHandler{
		PostService:         postService,
		ImageStorage:        imageStorage,
		hub:                 hub,
		friendService:       friendService,
		notificationService: notificationService,
	}
}

/*
type PostPayload struct {
	PostID uint `json:"post_id"`
	UserID uint `json:"user_id"`//el que genero el post
}

type likePayload struct {
	PostID uint `json:"post_id"`
	UserID uint `json:"user_id"`//el que dio like
}

type CommentPayload struct {
	PostID  uint   `json:"post_id"`
	UserID  uint   `json:"user_id"`//el que comento
	Content string `json:"content"`
}
*/

//func (s *FriendRequestService) ListFriends(userID uint) ([]dto.FriendsResponse, error) {
/*
type FriendsResponse struct {
	UserID uint `json:"user_id"`
	Username string `json:"username"`
}
*/
func (h *PostHandler) CreatePost(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(
			appErr.NewUnauthorized(
				"User ID not found in context",
			),
		)
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(
			appErr.NewUnauthorized(
				"Invalid user ID in context",
			),
		)
		c.Abort()
		return
	}

	var content string
	var imagePath *string
	var fileName *string

	contentType := c.GetHeader("Content-Type")

	if strings.Contains(
		contentType,
		"application/json",
	) {
		var req dto.CreatePostRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.Error(
				appErr.NewBadRequest(
					"invalid_request_body",
				),
			)
			c.Abort()
			return
		}

		content = req.Content
	} else {
		content = c.PostForm("content")

		/*
		 * El nombre multipart se mantiene como image por
		 * compatibilidad, aunque los posts admitan también PDF.
		 */
		file, err := c.FormFile("image")
		if err != nil &&
			!errors.Is(err, http.ErrMissingFile) {
			c.Error(
				appErr.NewBadRequest(
					"invalid_image_upload",
				),
			)
			c.Abort()
			return
		}

		if file != nil {
			savedPath, err :=
				h.ImageStorage.SavePostImage(file)

			if err != nil {
				c.Error(err)
				c.Abort()
				return
			}

			imagePath = &savedPath

			originalName :=
				sanitizeUploadedFileName(
					file.Filename,
				)

			fileName = &originalName
		}
	}

	post, err :=
		h.PostService.CreatePost(
			dto.CreatePostInput{
				UserID:    userID,
				Content:   content,
				ImagePath: imagePath,
				FileName:  fileName,
			},
		)

	if err != nil {
		if imagePath != nil {
			_ = h.ImageStorage.Delete(
				*imagePath,
			)
		}

		c.Error(err)
		c.Abort()
		return
	}
	friends, err := h.friendService.ListFriends(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	friendIds := make([]uint, 0, len(friends))
	for _, friend := range friends {
		friendIds = append(friendIds, friend.UserID)
	}

	login, _ := c.Get("login")
	username := ""
	if login != nil {
		username = login.(string)
	}

	payload, err := json.Marshal(dto.PostPayload{
		PostID:   post.ID,
		UserID:   userID,
		Username: username,
	})
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}

	for _, friendID := range friendIds {
		h.notificationService.Notify(friendID, "POST", payload)
	}

	log.Printf("Sent notifications to friends: %v", friendIds)
	c.JSON(http.StatusCreated, gin.H{
		"message": "post created",
		"data":    post,
	})
}

func (h *PostHandler) GetPostByID(
	c *gin.Context,
) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	paramStr := c.Param("id")

	id64, err := strconv.ParseUint(
		paramStr,
		10,
		32,
	)

	if err != nil || id64 == 0 {
		c.Error(
			appErr.NewBadRequest(
				"invalid_post_id",
			),
		)
		c.Abort()
		return
	}

	postID := uint(id64)

	post, err :=
		h.PostService.GetPostByID(
			postID,
			userID,
		)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"data": post,
		},
	)
}

// ListFeed devuelve los posts del usuario autenticado y de sus amistades.
func (h *PostHandler) ListFeed(
	c *gin.Context,
) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	page, limit, err :=
		parsePostListPagination(c)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	response, err :=
		h.PostService.ListFeed(
			userID,
			page,
			limit,
		)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, response)
}

// ListPostsByUserID devuelve las publicaciones del usuario indicado.
func (h *PostHandler) ListPostsByUserID(
	c *gin.Context,
) {
	userIDValue, err := strconv.ParseUint(
		c.Param("userId"),
		10,
		32,
	)

	if err != nil || userIDValue == 0 {
		c.Error(
			appErr.NewBadRequest(
				"invalid_user_id",
			),
		)
		c.Abort()
		return
	}

	page, limit, err :=
		parsePostListPagination(c)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	response, err :=
		h.PostService.ListPostsByUserID(
			uint(userIDValue),
			page,
			limit,
		)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *PostHandler) DeletePost(
	c *gin.Context,
) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(
			appErr.NewUnauthorized(
				"User ID not found in context",
			),
		)
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(
			appErr.NewUnauthorized(
				"Invalid user ID in context",
			),
		)
		c.Abort()
		return
	}

	paramStr := c.Param("id")

	id64, err := strconv.ParseUint(
		paramStr,
		10,
		32,
	)

	if err != nil || id64 == 0 {
		c.Error(
			appErr.NewBadRequest(
				"invalid_post_id",
			),
		)
		c.Abort()
		return
	}

	postID := uint(id64)

	imagePath, err :=
		h.PostService.DeletePost(
			userID,
			postID,
		)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if imagePath != nil {
		if err := h.ImageStorage.Delete(
			*imagePath,
		); err != nil {
			c.Error(appErr.NewInternal(err))
			c.Abort()
			return
		}
	}

	c.Status(http.StatusNoContent)
}

func parsePostListPagination(
	c *gin.Context,
) (int, int, error) {
	page := defaultPostListPage
	limit := defaultPostListLimit

	rawPage := strings.TrimSpace(
		c.Query("page"),
	)

	if rawPage != "" {
		parsedPage, err := strconv.Atoi(rawPage)

		if err != nil || parsedPage <= 0 {
			return 0, 0,
				appErr.NewBadRequest(
					"invalid_page",
				)
		}

		page = parsedPage
	}

	rawLimit := strings.TrimSpace(
		c.Query("limit"),
	)

	if rawLimit != "" {
		parsedLimit, err :=
			strconv.Atoi(rawLimit)

		if err != nil || parsedLimit <= 0 {
			return 0, 0,
				appErr.NewBadRequest(
					"invalid_limit",
				)
		}

		limit = parsedLimit
	}

	if limit > maxPostListLimit {
		limit = maxPostListLimit
	}

	return page, limit, nil
}

func sanitizeUploadedFileName(
	rawName string,
) string {
	normalizedName := strings.ReplaceAll(
		rawName,
		"\\",
		"/",
	)

	fileName := strings.TrimSpace(
		path.Base(normalizedName),
	)

	fileName = strings.Map(
		func(character rune) rune {
			if unicode.IsControl(character) {
				return -1
			}

			return character
		},
		fileName,
	)

	if fileName == "" || fileName == "." {
		return "attachment"
	}

	const maxFileNameLength = 255

	fileNameRunes := []rune(fileName)

	if len(fileNameRunes) <= maxFileNameLength {
		return fileName
	}

	extension := path.Ext(fileName)
	extensionRunes := []rune(extension)

	if len(extensionRunes) >= maxFileNameLength {
		return string(
			fileNameRunes[:maxFileNameLength],
		)
	}

	baseName := strings.TrimSuffix(
		fileName,
		extension,
	)

	baseNameRunes := []rune(baseName)

	maximumBaseLength :=
		maxFileNameLength -
			len(extensionRunes)

	return string(
		baseNameRunes[:maximumBaseLength],
	) + extension
}
