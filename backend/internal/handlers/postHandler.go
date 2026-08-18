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
	"net/http"
	"strconv"
	"strings"
	"log"
	ws "backend/internal/websocket"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	PostService  *services.PostService
	ImageStorage *storage.ImageStorage
	hub	*ws.Hub
	friendService *services.FriendRequestService
}

func NewPostHandler(friendService *services.FriendRequestService,hub *ws.Hub, postService *services.PostService, imageStorage *storage.ImageStorage) *PostHandler {
	return &PostHandler{
		PostService:  postService,
		ImageStorage: imageStorage,
		hub: hub,
		friendService: friendService,
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
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID in context"))
		c.Abort()
		return
	}

	var content string
	var imagePath *string

	contentType := c.GetHeader("Content-Type")

	if strings.Contains(contentType, "application/json") {
		var req dto.CreatePostRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.Error(appErr.NewBadRequest("invalid_request_body"))
			c.Abort()
			return
		}

		content = req.Content
	} else {
		content = c.PostForm("content")

		file, err := c.FormFile("image")
		if err != nil && !errors.Is(err, http.ErrMissingFile) {
			c.Error(appErr.NewBadRequest("invalid_image_upload"))
			c.Abort()
			return
		}

		if file != nil {
			savedPath, err := h.ImageStorage.SavePostImage(file)
			if err != nil {
				c.Error(err)
				c.Abort()
				return
			}

			imagePath = &savedPath
		}
	}

	post, err := h.PostService.CreatePost(dto.CreatePostInput{
		UserID:    userID,
		Content:   content,
		ImagePath: imagePath,
	})
	if err != nil {
		if imagePath != nil {
			_ = h.ImageStorage.Delete(*imagePath)
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
	friendIds := make([]uint, len(friends))
	for _, friend := range friends {
		friendIds = append(friendIds, friend.UserID)
	}
	payload, err := json.Marshal(dto.PostPayload{
		PostID: post.ID,
		UserID: userID,
	})
	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}
	message, err := json.Marshal(dto.NotificationMessage{
		Type: "POST",
		Payload: payload,
	})

	if err != nil {
		c.Error(appErr.NewInternal(err))
		c.Abort()
		return
	}
	friendIds = append(friendIds, userID) //solo para probar, no tengo accept friend en front
	h.hub.SendMessagesToUsers(friendIds, []byte(message))
	log.Printf("Sent message to friends: %v", friendIds)
	c.JSON(http.StatusCreated, gin.H{
		"message": "post created",
		"data":    post,
	})
}

func (h *PostHandler) GetPostByID(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	paramStr := c.Param("id")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil || id64 == 0 {
		c.Error(appErr.NewBadRequest("invalid_post_id"))
		c.Abort()
		return
	}

	postID := uint(id64)

	post, err := h.PostService.GetPostByID(postID, userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": post,
	})
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.Error(appErr.NewUnauthorized("User ID not found in context"))
		c.Abort()
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("Invalid user ID in context"))
		c.Abort()
		return
	}

	paramStr := c.Param("id")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil || id64 == 0 {
		c.Error(appErr.NewBadRequest("invalid_post_id"))
		c.Abort()
		return
	}

	postID := uint(id64)

	imagePath, err := h.PostService.DeletePost(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if imagePath != nil {
		if err := h.ImageStorage.Delete(*imagePath); err != nil {
			c.Error(appErr.NewInternal(err))
			c.Abort()
			return
		}
	}

	c.Status(http.StatusNoContent)
}
