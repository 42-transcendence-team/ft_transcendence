package dto

type SendFriendRequest struct {
	ReceiverID uint `json:"receiver_id" binding:"required"`
}

type FriendRequestResponse struct {
	ID     uint `json:"id"`
	UserID uint `json:"user_id"`
	// cuando este hecho el perfil hay que devolver una respuesta unida entre user y esto
	Username string `json:"username"`
	// AvatarURL string `json:"avatar_url"`
	Status string `json:"status"`
	Type   string `json:"type"`
}
