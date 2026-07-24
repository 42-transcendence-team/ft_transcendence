package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	"encoding/json"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

type NotificationsHandler struct {
	friendService     *services.FriendRequestService
	websocketService  *services.WebsocketService
	chatService       *services.ChatService
	notificationService *services.NotificationService
}

func NewNotificationsHandler(
	friendService *services.FriendRequestService,
	websocketService *services.WebsocketService,
	chatService *services.ChatService,
	notificationService *services.NotificationService,
) *NotificationsHandler {
	return &NotificationsHandler{
		friendService:       friendService,
		websocketService:    websocketService,
		chatService:         chatService,
		notificationService: notificationService,
	}
}

func (h *NotificationsHandler) GetNotifications(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var notificationFeed []dto.NotificationMessage

	incomingRequests, err := h.friendService.ListIncomingRequest(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to list incoming requests"})
		return
	}
	for _, req := range incomingRequests {
		payload, err := json.Marshal(req)
		if err != nil {
			log.Printf("Error marshaling friend request: %v", err)
			continue
		}
		notificationFeed = append(notificationFeed, dto.NotificationMessage{
			Type:    "FRIEND_REQUEST",
			Payload: payload,
		})
	}

	rooms, err := h.websocketService.GetUserRooms(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get user rooms"})
		return
	}

	for _, room := range rooms {
		unreadCount := h.chatService.GetMessageNotRead(room.ID, userID)
		if unreadCount > 0 {
			payload, err :=
				json.Marshal(gin.H{
					"room_id":      room.ID,
					"unread_count": unreadCount,
				})
			if err != nil {
				log.Printf("Error marshaling unread count payload: %v", err)
				continue
			}
			notificationFeed = append(notificationFeed, dto.NotificationMessage{
				Type:    "UNREAD_MESSAGES",
				Payload: payload,
			})
		}
	}

	dbNotifications, err := h.notificationService.ListUnread(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to list notifications"})
		return
	}
	for _, notif := range dbNotifications {
		id := notif.ID
		notificationFeed = append(notificationFeed, dto.NotificationMessage{
			ID:      &id,
			Type:    notif.Type,
			Payload: json.RawMessage(notif.Payload),
		})
	}

	c.JSON(200, notificationFeed)
}

func (h *NotificationsHandler) MarkAsRead(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id64 == 0 {
		c.JSON(400, gin.H{"error": "invalid notification id"})
		return
	}

	if err := h.notificationService.MarkAsRead(uint(id64), userID); err != nil {
		c.JSON(404, gin.H{"error": "notification not found"})
		return
	}

	c.Status(204)
}
