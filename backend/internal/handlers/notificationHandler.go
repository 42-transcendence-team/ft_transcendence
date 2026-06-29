package handlers

//package handlers
import (
	"backend/internal/dto"
	"backend/internal/services"
	"encoding/json"
	"github.com/gin-gonic/gin"
)

//import (
//	"backend/internal/dto"
//	appErr "backend/internal/errors"
//	"backend/internal/services"
//	"strconv"

type NotificationsHandler struct {
	friendService	*services.FriendRequestService
	ChatService		*services.ChatService
}

func NewNotificationsHandler(friendService *services.FriendRequestService, chatService *services.ChatService) *NotificationsHandler {
	return &NotificationsHandler{
		friendService: friendService,
		ChatService: chatService,
	}
}

//ListIncomingRequest(userID uint)([]dto.FriendRequestResponse, error)
//func (s *ChatService)GetMessageNotRead(roomId uint, userID uint) uint {
//func (s *ChatService) GetUserRooms(userID uint) ([]models.ChatRoom, error) {



func (h *NotificationsHandler) GetNotifications(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var notificationFeed []dto.NotificationMessage

	incomingRequests, err := h.friendService.ListIncomingRequest(userID)
	if err != nil {
		return
	}
	for _, req := range incomingRequests {
		payload, err := json.Marshal(req)
		if err != nil {
			return
		}
		notificationFeed = append(notificationFeed, dto.NotificationMessage{
			Type:    "FRIEND_REQUEST",
			Payload: payload,
		})
	}

	rooms, err := h.ChatService.GetUserRooms(userID)
	if err != nil {
		return
	}

	for _, room := range rooms {
		unreadCount := h.ChatService.GetMessageNotRead(room.ID, userID)
		//aqui intentar no hacer tantas llamadas a la base de datos
		payload,err := json.Marshal(gin.H{
				"room_id":      room.ID,
				"unread_count": unreadCount,
			})
		if err != nil {
		}
		if unreadCount > 0 {
			notificationFeed = append(notificationFeed, dto.NotificationMessage{
				Type: "UNREAD_MESSAGES",
				Payload: payload,
			})
		}
	}

	c.JSON(200, notificationFeed)
}
