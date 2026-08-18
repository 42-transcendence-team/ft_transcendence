package handlers

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/services"
	"strconv"
	ws "backend/internal/websocket"
	"github.com/gin-gonic/gin"
	"encoding/json"
)

type FriendHandler struct {
	FriendRequestService *services.FriendRequestService
	BlockUserService     *services.BlockUserService
	websocketService     *services.WebsocketService
	hub				  *ws.Hub
}

func NewFriendHandler(friendService *services.FriendRequestService, blockService *services.BlockUserService, hub *ws.Hub, websocketService *services.WebsocketService) *FriendHandler {
	return &FriendHandler{
		FriendRequestService: friendService,
		BlockUserService:     blockService,
		hub:                  hub,
		websocketService:     websocketService,
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
	payload, perr:=
		json.Marshal(dto.FriendRequestPayload{
			SenderID: userID,
			ReceiverID: req.ReceiverID,
		})
	if (perr != nil) {
		c.Error(perr)
		c.Abort()
		return
	}
	message, merr :=
		json.Marshal(dto.NotificationMessage{
			Type : "FRIEND_REQUEST",
			Payload: payload,
		})
	if (merr != nil) {
		c.Error(merr)
		c.Abort()
		return
	}
	
	h.hub.SendMessagesToUser(req.ReceiverID, []byte(message))
	
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

	response, err := h.FriendRequestService.ListOutgoingRequest(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": response,
	})
}

func (h *FriendHandler) ListIncomingRequests(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	response, err := h.FriendRequestService.ListIncomingRequest(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

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
	payload, perr :=
		json.Marshal(dto.FriendRequestAcceptedPayload{
			SenderID: userID,
			ReceiverID: reqID,
		})
	if (perr != nil){
		c.Error(perr)
		c.Abort()
		return
	}
	message, merr :=
		json.Marshal(dto.NotificationMessage{
			Type : "FRIEND_REQUEST_ACCEPTED",
			Payload: payload,
		})
	if (merr != nil){
		c.Error(merr)
		c.Abort()
		return
	}
	h.hub.SendMessagesToUser(req.SenderID, []byte(message))
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

	h.notifyRoomBlocked(userID, deleteFriendID)

	c.JSON(204, gin.H{})
}

func (h *FriendHandler) ListBlocks(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	ListBlocks, err := h.BlockUserService.ListBlocks(userID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"data": ListBlocks,
	})
}

func (h *FriendHandler) BlockUser(c *gin.Context) {

	var req dto.SendBlockedRequest

	err := ValidationBindRequest(c, &req)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	BlockerID := c.MustGet("userID").(uint)
	err = h.BlockUserService.BlockUser(BlockerID, req.BlockedID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	h.notifyRoomBlocked(BlockerID, req.BlockedID)

	c.JSON(200, gin.H{"message": "user blocked"})
}

func (h *FriendHandler) UnblockUser(c *gin.Context) {
	Blocked := c.Param("userId")

	id64, err := strconv.ParseUint(Blocked, 10, 32)
	if err != nil {
		c.Error(appErr.NewBadRequest("Invalid request"))
		c.Abort()
		return
	}

	deleteFriendID := uint(id64)

	userID := c.MustGet("userID").(uint)
	err = h.BlockUserService.UnblockUser(userID, deleteFriendID)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(204, gin.H{})
}

// notifyRoomBlocked busca la sala compartida entre dos usuarios. Si existe,
// envia un mensaje WS de tipo ROOM_BLOCKED a ambos para que el frontend oculte el chat.
func (h *FriendHandler) notifyRoomBlocked(userID1 uint, userID2 uint) {
	roomID, err := h.websocketService.GetSharedRoom(userID1, userID2)
	if err != nil || roomID == 0 {
		return
	}

	payload, err := json.Marshal(dto.RoomPayload{RoomID: roomID})
	if err != nil {
		return
	}
	message, err := json.Marshal(dto.NotificationMessage{
		Type:    "ROOM_BLOCKED",
		Payload: payload,
	})
	if err != nil {
		return
	}

	h.hub.SendMessagesToUsers([]uint{userID1, userID2}, message)
}
