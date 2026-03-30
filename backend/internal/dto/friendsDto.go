package dto

import (
	"backend/internal/models"
)

type SendFriendRequest struct {
	ReceiverID uint `json:"receiver_id" binding:"required"`
}

type FriendRequestResponse struct {
	ID     uint `json:"id"`
	UserID uint `json:"user_id"`
	// cuando este hecho el perfil hay que devolver una respuesta unida entre user y esto
	// Username  string `json:"username"`
	// AvatarURL string `json:"avatar_url"`
	Status string `json:"status"`
	Type   string `json:"type"`
}

func MapToResponse(reqs []models.FriendRequest, currentUserID uint) []FriendRequestResponse {

	var res []FriendRequestResponse

	for _, r := range reqs {

		var otherUserID uint
		var reqType string

		if r.SenderID == currentUserID {
			otherUserID = r.ReceiverID
			reqType = "outgoing"
		} else {
			otherUserID = r.SenderID
			reqType = "incoming"
		}

		res = append(res, FriendRequestResponse{
			ID:     r.ID,
			UserID: otherUserID,
			Status: string(r.Status),
			Type:   reqType,
		})
	}

	return res
}
