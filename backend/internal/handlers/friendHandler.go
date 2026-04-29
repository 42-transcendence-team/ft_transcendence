package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FriendHandler struct {
	FriendRequestService *services.FriendRequestService
}

func NewFriendHandler(friendService *services.FriendRequestService) *FriendHandler {
	return &FriendHandler{
		FriendRequestService: friendService,
	}
}

// TODO: al devolver la peticion alomejor hay que gestioanr que ya devuelva los datos del amigo para poder ensearlo en front, nombre foto de perfil etc
func (h *FriendHandler) ListFriends(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	ListFriends, err := h.FriendRequestService.ListFriends(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": ListFriends,
	})
}

/*
{
	"receiver_id": 1
}
*/

func (h *FriendHandler) SendFriendRequest(c *gin.Context) {

	var req dto.SendFriendRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	userID := c.MustGet("userID").(uint)

	newReqFriend, err := h.FriendRequestService.SendRequest(req.ReceiverID, userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(201, gin.H{
		"message": "friend request sent successfully",
		"data": gin.H{
			"id":         newReqFriend.ID,
			"senderID":   newReqFriend.SenderID,
			"receiverID": newReqFriend.ReceiverID,
			"status":     newReqFriend.Status,
		},
	})
}

func (h *FriendHandler) ListOutgoingRequests(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	listOutReq, err := h.FriendRequestService.ListOutgoingRequest(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	response := dto.MapToResponse(listOutReq, userID)

	c.JSON(200, gin.H{
		"data": response,
	})
}

func (h *FriendHandler) ListIncomingRequests(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	listIncReq, err := h.FriendRequestService.ListIncomingRequest(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	response := dto.MapToResponse(listIncReq, userID)

	c.JSON(200, gin.H{
		"data": response,
	})
}

func (h *FriendHandler) AcceptFriendRequest(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	paramStr := c.Param("requestId")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil {
		c.Error(appErr.NewBadRequest("Invalid request"))
		c.Abort()
		return
	}

	reqID := uint(id64)

	req, err := h.FriendRequestService.AcceptFriendRequest(userID, reqID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"request-accepted": gin.H{
			"id":       req.ID,
			"senderID": req.SenderID,
			"userID":   req.ReceiverID,
		},
	})
}

func (h *FriendHandler) RejectFriendRequest(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	paramStr := c.Param("requestId")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil {
		c.Error(appErr.NewBadRequest("Invalid request"))
		c.Abort()
		return
	}

	reqID := uint(id64)

	req, err := h.FriendRequestService.RejectFriendRequest(userID, reqID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"request-rejected": gin.H{
			"id":       req.ID,
			"senderID": req.SenderID,
			"userID":   req.ReceiverID,
		},
	})
}

func (h *FriendHandler) DeleteFriend(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	paramStr := c.Param("userId")

	id64, err := strconv.ParseUint(paramStr, 10, 32)
	if err != nil {
		c.Error(appErr.NewBadRequest("Invalid request"))
		c.Abort()
		return
	}

	deleteFriendID := uint(id64)

	err = h.FriendRequestService.DeleteFriend(userID, deleteFriendID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(204, gin.H{})
}
