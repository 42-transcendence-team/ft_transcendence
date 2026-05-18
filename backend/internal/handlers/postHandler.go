package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	postService *services.PostService
}

func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	body := c.PostForm("body")

	image, err := c.FormFile("image")
	if err != nil {
		image = nil
	}

	post, err := h.postService.CreatePost(userID, body, image)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(201, gin.H{
		"data": post,
	})
}

func (h *PostHandler) ListPosts(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	page := parseQueryInt(c, "page", 1)
	limit := parseQueryInt(c, "limit", 20)

	posts, err := h.postService.ListPosts(userID, page, limit)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": posts,
	})
}

func (h *PostHandler) GetPostByID(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := parseUintParam(c, "postId")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	post, err := h.postService.GetPostByID(userID, postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": post,
	})
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := parseUintParam(c, "postId")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	if err := h.postService.DeletePost(userID, postID); err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(204, gin.H{})
}

func (h *PostHandler) CreateComment(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := parseUintParam(c, "postId")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	var req dto.CreateCommentRequest
	if err := ValidationBindRequest(c, &req); err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	comment, err := h.postService.CreateComment(userID, postID, req.Body)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(201, gin.H{
		"data": comment,
	})
}

func (h *PostHandler) ListComments(c *gin.Context) {
	postID, err := parseUintParam(c, "postId")
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	comments, err := h.postService.ListComments(postID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": comments,
	})
}

func parseUintParam(c *gin.Context, name string) (uint, error) {
	paramStr := c.Param(name)

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil {
		return 0, appErr.NewBadRequest("invalid " + name)
	}

	return uint(id64), nil
}

func parseQueryInt(c *gin.Context, name string, defaultValue int) int {
	valueStr := c.Query(name)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}
