package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"github.com/gin-gonic/gin"
)

type FriendHandler struct {
	FriendService *services.FriendService
}

func NewFriendHandler(friendService *services.FriendService) *FriendHandler {
	return &FriendHandler{
		FriendService: friendService,
	}
}

func (h *FriendHandler) ListFriends(c *gin.Context) {

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

	userIDValue, exist := c.Get("userID")
	if !exist {
		c.Error(appErr.NewUnauthorized("unauthorized"))
		c.Abort()
		return
	}

	userId, ok := userIDValue.(uint)
	if !ok {
		c.Error(appErr.NewUnauthorized("invalid_user_context"))
		c.Abort()
		return
	}

	newReqFriend, err := h.FriendService.SendRequest(req.ReceiverID, userId)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"id":           newReqFriend.ID,
		"username":     newReqFriend.Login,
		"is_friend":    false,
		"request_sent": 12,
	})
}

func (h *FriendHandler) ListOutgoingRequests(c *gin.Context) {

}

func (h *FriendHandler) ListIncomingRequests(c *gin.Context) {

}

func (h *FriendHandler) AcceptFriendRequest(c *gin.Context) {

}

func (h *FriendHandler) RejectFriendRequest(c *gin.Context) {

}
