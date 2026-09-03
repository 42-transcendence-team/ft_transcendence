package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"encoding/json"
	"net/http"
	"strconv"
	ws "backend/internal/websocket"
	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	CommentService      *services.CommentService
	notificationService *services.NotificationService
	hub                 *ws.Hub
}

func NewCommentHandler(hub *ws.Hub, commentService *services.CommentService, notificationService *services.NotificationService) *CommentHandler {
	return &CommentHandler{
		CommentService:      commentService,
		notificationService: notificationService,
		hub:                 hub,
	}
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
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

	postID, err := parseUintParam(c.Param("id"), "invalid_post_id")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	var req dto.CreateCommentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(appErr.NewBadRequest("invalid_request_body"))
		c.Abort()
		return
	}

	comment, postOwnerID, err := h.CommentService.CreateComment(dto.CreateCommentInput{
		PostID:  postID,
		UserID:  userID,
		Content: req.Content,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if postOwnerID != 0 && postOwnerID != userID {
		login, _ := c.Get("login")
		username := ""
		if login != nil {
			username = login.(string)
		}
		payload, err := json.Marshal(dto.CommentPayload{
			PostID:   postID,
			UserID:   userID,
			Username: username,
			Content:  req.Content,
		})
		if err == nil {
			h.notificationService.Notify(postOwnerID, "COMMENT", payload)
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "comment created",
		"data":    comment,
	})
}

func (h *CommentHandler) ListCommentsByPostID(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	postID, err := parseUintParam(c.Param("id"), "invalid_post_id")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	comments, err := h.CommentService.ListCommentsByPostID(postID, userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": comments,
	})
}

// Esto podría ir en un helper común, pero se queda aquí por simplicidad
func parseUintParam(param string, errorMessage string) (uint, error) {
	id64, err := strconv.ParseUint(param, 10, 32)
	if err != nil || id64 == 0 {
		return 0, appErr.NewBadRequest(errorMessage)
	}

	return uint(id64), nil
}

func (h *CommentHandler) DeleteComment(c *gin.Context) {
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

	commentID, err := parseUintParam(c.Param("id"), "invalid_comment_id")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	err = h.CommentService.DeleteComment(userID, commentID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.Status(http.StatusNoContent)
}
