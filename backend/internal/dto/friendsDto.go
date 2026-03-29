package dto

type SendFriendRequest struct {
	ReceiverID uint `json:"receiver_id" binding:"required"`
}
