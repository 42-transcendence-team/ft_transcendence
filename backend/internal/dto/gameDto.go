package dto

import "encoding/json"

type GameMessage struct {
	Type      string `json:"type"`
	SubType   string `json:"subtype"`
	UserID    uint   `json:"user_id"`
	Game_type string `json:"game_type"`
	Mode      string `json:"mode"`
}

type GameAction struct {
	Action string `json:"action"`
}

type CreateGame struct {
	Action   string `json:"action"`
	GameType string `json:"game_type"`
	Mode     string `json:"mode"`
}

type JoinGame struct {
	Action string `json:"action"`
	GameID uint   `json:"game_id"`
	Type   string `json:"game_type"`
}

type LeaveGame struct {
	Action string `json:"action"`
	GameID uint   `json:"game_id"`
	Type   string `json:"game_type"`
}

type MakeMove struct {
	Action  string          `json:"action"`
	GameID  uint            `json:"game_id"`
	Payload json.RawMessage `json:"payload"`
}

type GameEvent struct {
	Type    string      `json:"type"`
	GameID  uint        `json:"game_id"`
	Status  string      `json:"status,omitempty"`
	Payload interface{} `json:"payload"`
}
