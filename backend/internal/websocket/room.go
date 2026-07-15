package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"backend/internal/models"
)

type Room struct {
	ID      uint
	Name    string
	Private bool
	Clients map[*Client]bool

	Join  chan *Client
	Leave chan *Client
	destroy chan *Client
	Broadcast chan []byte
	hub       *Hub
	mu 	sync.RWMutex
}

func NewRoom(id uint, name string, private bool, hub *Hub) *Room {
	return &Room{
		ID:        id,
		Name:      name,
		Private:   private,
		Clients:   make(map[*Client]bool),
		Join:      make(chan *Client),
		Leave:     make(chan *Client),
		destroy:     make(chan *Client, 1),
		Broadcast: make(chan []byte),
		hub:       hub,
	}
}

func (r *Room) broadcast(message []byte) {
	for client := range r.Clients {
		select {
		case client.SendChan <- message:
		default:
			r.mu.Lock()
			close(client.SendChan)
			delete(r.Clients, client)
			delete(client.Rooms, r.ID)
			r.mu.Unlock()
		}
	}
}

func (r *Room) Run() {
	for {
		select {
			case client := <-r.Join:
				r.mu.Lock()
				r.Clients[client] = true
				client.Rooms[r.ID] = r
				joinMsg := client.Username + " se ha unido a la sala."
				msg, err := json.Marshal(joinMsg)
				r.mu.Unlock()
				if err != nil {
					log.Printf("Error marshaling join message: %v", err)
					continue
				}
				r.broadcast(msg)

			case client := <-r.Leave:
				r.mu.Lock()
				if _, ok := r.Clients[client]; ok {
					delete(r.Clients, client)
					delete(client.Rooms, r.ID)

					leaveMsg := map[string]any{
						"type":    "system",
						"content": client.Username + " abandonó la sala.",
					}
					msg, err := json.Marshal(leaveMsg)
					if err != nil {
						log.Printf("Error marshaling leave message: %v", err)
						r.mu.Unlock()
						continue
					}
					r.mu.Unlock()
					r.broadcast(msg)
				} else {
					r.mu.Unlock()
				}

			case message := <-r.Broadcast:
				r.broadcast(message)

			case client := <-r.destroy:
				r.mu.Lock()
				if _, ok := r.Clients[client]; ok {
					delete(r.Clients, client)
					delete(client.Rooms, r.ID)
				}
				empty := len(r.Clients) == 0

				if empty {
					r.cleanup()
					return
				}
				r.mu.Unlock()
		}
	}
}

func (r *Room) cleanup() {
    close(r.Join)
    close(r.Leave)
    close(r.Broadcast)
    close(r.destroy)

    r.hub.RemoveRoom(r.ID)
	err := r.hub.db.Delete(&models.ChatRoom{}, r.ID).Error
	if err != nil {
		log.Printf("Error deleting room from database: %v", err)
	}
}
