package handlers

import (
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

/*
{
	newFriendUser: "json: newFriendUser"
}
*/

func (h *FriendHandler) SendFriendRequest(c *gin.Context) {

}
