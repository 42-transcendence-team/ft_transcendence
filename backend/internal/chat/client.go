package chat

import (
	"backend/internal/models"
	"backend/internal/services"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// sacado del repo original de websocket gorila
//https://github.com/gorilla/websocket/blob/main/examples/chat/client.go
const (
	writeWait = 10 * time.Second  // Time allowed to write a message to the peer.
	pongWait = 60 * time.Second // Time allowed to read the next pong message from the peer.
	pingPeriod = (pongWait * 9) / 10 // Send pings to peer with this period. Must be less than pongWait.
	maxMessageSize = 512 // Maximum message size allowed from peer.
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	hub *Hub // La chat en server-side
	conn *websocket.Conn 	// el socket
	send chan []byte // Buffer

	userID uint
	chatService *services.ChatService // Para la BD
}

type WsRequest struct {
	Action   string `json:"action"`    // "subscribe", "unsubscribe" o "message"
	Type     string `json:"type"`      // "room" o "dm" (Aplica a message, subscribe...)
	TargetID uint   `json:"target_id"` // El ID de la Room o de la Conversation
	Body     string `json:"body"`      // El texto del mensaje (solo si action=="message")
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	
	for {
		var req WsRequest
		
		err := c.conn.ReadJSON(&req)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// el nombre interno de la sala en el Hub (ej: "room_1" o "dm_5")
		roomName := ""
		if req.Type == "room" {
			roomName = fmt.Sprintf("room_%d", req.TargetID)
		} else if req.Type == "dm" {
			roomName = fmt.Sprintf("dm_%d", req.TargetID)
		}

		// Miramos qué quiere hacer el Frontend
		switch req.Action {
		case "subscribe":
			c.hub.subscribe <- Subscription{Client: c, Room: roomName}
			
		case "unsubscribe":
			c.hub.unsubscribe <- Subscription{Client: c, Room: roomName}

		case "message":
			// Mismo código que antes para guardar en BD
			msg := models.Message{
				SenderID: c.userID,
				Body:     req.Body,
				Status:   "sent",
			}

			if req.Type == "room" {
				msg.RoomID = &req.TargetID
			} else if req.Type == "dm" {
				msg.ConversationID = &req.TargetID
			}

			savedMsg, err := c.chatService.SaveMessage(&msg)
			if err != nil {
				log.Printf("Error guardando el mensaje en BD: %v", err)
				continue
			}

			payloadJSON, err := json.Marshal(savedMsg)
			if err != nil {
				log.Printf("Error convirtiendo mensaje a JSON: %v", err)
				continue
			}

			// Creamos el payload con destino y se lo damos al Hub
			c.hub.broadcast <- MessagePayload{
				Room: roomName,
				Data: payloadJSON,
			}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for range n {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Maneja las lecturas y escrituras de los websockets
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, userID uint, chatService *services.ChatService) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	
	client := &Client{
		hub:         hub, 
		conn:        conn, 
		send:        make(chan []byte, 256),
		userID:      userID,
		chatService: chatService,
	}
	
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
