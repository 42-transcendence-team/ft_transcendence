package dto

import (
	"encoding/json"
)

type UserStatusPayload struct {
	UserID uint   `json:"user_id"`
	Login  string `json:"login"`
	State  string `json:"state"`
}

type FriendRequestPayload struct {
	SenderID   uint `json:"sender_id"`//esto deberia ser string
	ReceiverID uint `json:"receiver_id"`//deberia ser string
}

type FriendRequestAcceptedPayload struct {
	SenderID   uint   `json:"sender_id"`   //el que acepta la soli
	ReceiverID uint   `json:"receiver_id"` //el que envio la soli de amistad
	Username   string `json:"username"`
}

type RoomPayload struct {
	RoomID uint `json:"room_id"`
}

type PostPayload struct {
	PostID   uint   `json:"post_id"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
}

type LikePayload struct {
	PostID   uint   `json:"post_id"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
}

type CommentPayload struct {
	PostID   uint   `json:"post_id"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Content  string `json:"content"`
}

type NotificationMessage struct {
	ID      *uint           `json:"id,omitempty"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}
