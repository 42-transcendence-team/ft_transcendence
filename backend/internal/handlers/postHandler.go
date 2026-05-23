package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	PostService *services.PostService
}

func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{
		PostService: postService,
	}
}

func (h *PostHandler) CreateTextPost(c *gin.Context) {
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

	var req dto.CreatePostRequest

	if err := c.ShouldBind(&req); err != nil {
		c.Error(appErr.NewBadRequest("invalid_request_body"))
		c.Abort()
		return
	}

	post, err := h.PostService.CreateTextPost(dto.CreatePostInput{
		UserID:  userID,
		Content: req.Content,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "post created",
		"data":    post,
	})
}

func (h *PostHandler) GetPostByID(c *gin.Context) {
	paramStr := c.Param("id")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil || id64 == 0 {
		c.Error(appErr.NewBadRequest("invalid_post_id"))
		c.Abort()
		return
	}

	postID := uint(id64)

	post, err := h.PostService.GetPostByID(postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": post,
	})
}
