package handlers
//package handlers
import (
	"backend/internal/services"
	"github.com/gin-gonic/gin"
	"log"
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

	incomingRequests, err := h.friendService.ListIncomingRequest(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve notifications"})
		return
	}
	
	rooms, err := h.ChatService.GetUserRooms(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve notifications"})
		return
	}

	messagesNotReadByRoom := make(map[uint]uint)
	for _, room := range rooms {
		unreadCount := h.ChatService.GetMessageNotRead(room.ID, userID)
		messagesNotReadByRoom[room.ID] = unreadCount
	}
	//likes,posts
	response := gin.H{
		"incoming_requests": incomingRequests,
		"unread_messages":   messagesNotReadByRoom,
	}

	log.Printf("noti %v", response)
	c.JSON(200, response)
}
