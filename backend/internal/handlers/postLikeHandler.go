package handlers

import (
	appErr "backend/internal/errors"
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PostLikeHandler struct {
	PostLikeService *services.PostLikeService
}

func NewPostLikeHandler(
	postLikeService *services.PostLikeService,
) *PostLikeHandler {
	return &PostLikeHandler{
		PostLikeService: postLikeService,
	}
}

// LikePost crea un like o sustituye un dislike existente.
func (h *PostLikeHandler) LikePost(c *gin.Context) {
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

	reactionState, err := h.PostLikeService.LikePost(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "post liked",
		"data":    reactionState,
	})
}

// UnlikePost elimina el like del usuario.
// Si tiene un dislike o ninguna reacción, no modifica nada.
func (h *PostLikeHandler) UnlikePost(c *gin.Context) {
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

	reactionState, err := h.PostLikeService.UnlikePost(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "post unliked",
		"data":    reactionState,
	})
}

// DislikePost crea un dislike o sustituye un like existente.
func (h *PostLikeHandler) DislikePost(c *gin.Context) {
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

	reactionState, err := h.PostLikeService.DislikePost(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "post disliked",
		"data":    reactionState,
	})
}

// UndislikePost elimina el dislike del usuario.
// Si tiene un like o ninguna reacción, no modifica nada.
func (h *PostLikeHandler) UndislikePost(c *gin.Context) {
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

	reactionState, err := h.PostLikeService.UndislikePost(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "post undisliked",
		"data":    reactionState,
	})
}

func getUserIDFromContext(c *gin.Context) (uint, error) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		return 0, appErr.NewUnauthorized(
			"User ID not found in context",
		)
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		return 0, appErr.NewUnauthorized(
			"Invalid user ID in context",
		)
	}

	return userID, nil
}
