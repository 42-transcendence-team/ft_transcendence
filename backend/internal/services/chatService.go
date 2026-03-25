package services

import (
	"backend/internal/models"
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Hub struct {
	Clients    map[string]map[*Client]bool // channelID -> clients
	Broadcast  chan Message
	Register   chan *Client
	Unregister chan *Client
	Db         *gorm.DB
}

type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	Send     chan []byte
	UserID   uint
	Channels []string
}

type Message struct {
	ChannelID string `json:"channel_id"`
	Content   string `json:"content"`
	SenderID  uint   `json:"sender_id"`
}


func NewHub(db *gorm.DB) *Hub {
	return &Hub{
		Broadcast:  make(chan Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[string]map[*Client]bool),
		Db:         db,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			for _, chID := range client.Channels {
				if h.Clients[chID] == nil {
					h.Clients[chID] = make(map[*Client]bool)
				}
				h.Clients[chID][client] = true
			}
		case client := <-h.Unregister:
			for _, chID := range client.Channels {
				if set, ok := h.Clients[chID]; ok {
					delete(set, client)
					if len(set) == 0 {
						delete(h.Clients, chID)
					}
				}
			}
			close(client.Send)
		case msg := <-h.Broadcast:
			data, _ := json.Marshal(msg)
			for client := range h.Clients[msg.ChannelID] {
				select {
				case client.Send <- data:
				default:
					h.Unregister <- client
				}
			}
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait));
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		var msg Message
		if err := json.Unmarshal(message, &msg); err == nil {
			msg.SenderID = c.UserID
			// Persistence
			c.Hub.Db.Create(&models.ChatMessage{
				ChannelID: msg.ChannelID,
				SenderID:  c.UserID,
				Content:   msg.Content,
			})
			c.Hub.Broadcast <- msg
		}
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
