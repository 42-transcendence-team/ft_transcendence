package dto

import "encoding/json"

type ChatUserInfo struct {
	ID    uint   `json:"id"`
	Login string `json:"login"`
}

type Message struct {
	MessageID uint   `json:"message_id"`
	UserID    uint   `json:"user_id"`
	Content   string `json:"content"`
	Username  string `json:"username"`
	Timestamp string `json:"timestamp,omitempty"`
	Type      string `json:"type"`
	RoomID    uint   `json:"room_id"`
}

type Msg struct {
	MessageID uint   `json:"message_id"`
	Content   string `json:"content"`
	Username  string `json:"username"`
	Timestamp string `json:"timestamp,omitempty"`
}

type Messages struct {
	RoomID uint   `json:"room_id"`
	Type   string `json:"type"`
	Msgs   []Msg  `json:"messages"`
}

type CreateRoomRequest struct {
	Name    string `json:"name"`
	Private bool   `json:"private" default:"false"`
	Users   []uint `json:"users"`
}

type IncomingMessage struct {
	Type     string          `json:"type"`     // Tipo de mensaje (ej, "join_room", "leave_room", "message")
	RoomID   uint            `json:"room_id"`  // ID de la sala
	UserID   uint            `json:"user_id"`  // ID del usuario que envía el mensaje
	Username string          `json:"username"` // Nombre del usuario que envía el mensaje
	Message  string          `json:"content"`  // Contenido del mensaje
	Payload  json.RawMessage `json:"payload,omitempty"`
}
