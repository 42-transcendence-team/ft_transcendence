package dto

import (
	"encoding/json"
)

type FriendRequestPayload struct {
	SenderID   uint `json:"sender_id"`//esto deberia ser string
	ReceiverID uint `json:"receiver_id"`//deberia ser string
}

type FriendRequestAcceptedPayload struct {
	SenderID	uint `json:"sender_id"`//el que acepta la soli
	ReceiverID	uint `json:"receiver_id"`//el que envio la soli de amistad
}

type RoomPayload struct {
	RoomID uint `json:"room_id"`
}

type NotificationMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

