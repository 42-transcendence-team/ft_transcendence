package games

import "encoding/json"

type Player struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Type     string `json:"type"`
	Token    string `json:"token"`
}

type GameEngine interface {
	Init()
	ProcessMove(userID uint, actionPayload json.RawMessage) error
	GetState() interface{}
	IsFinished() bool
	GetWinner() (int, interface{})
	IsFull() bool
	JoinGame(userID uint) error
}
