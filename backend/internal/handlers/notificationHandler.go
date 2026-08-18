package handlers

import (
	"backend/internal/dto"
	"backend/internal/services"
	"encoding/json"
	"log"

	"github.com/gin-gonic/gin"
)

type NotificationsHandler struct {
	friendService	*services.FriendRequestService
	websocketService *services.WebsocketService
	chatService *services.ChatService
}

func NewNotificationsHandler(friendService *services.FriendRequestService, websocketService *services.WebsocketService, chatService *services.ChatService) *NotificationsHandler {
	return &NotificationsHandler{
		friendService: friendService,
		websocketService: websocketService,
		chatService: chatService,
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
		//TODO: aqui intentar no hacer tantas llamadas a la base de datos
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

	c.JSON(200, notificationFeed)
}
