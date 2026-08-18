package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

type Room struct {
	ID      uint
	Name    string
	Private bool
	Clients map[*Client]bool

	Join  chan *Client
	Leave chan *Client
	destroy chan struct{}
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
		Join:      make(chan *Client, 1),
		Leave:     make(chan *Client, 1),
		destroy:     make(chan struct{}, 1),
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
			delete(r.Clients, client)
			client.Mu.Lock()
			delete(client.Rooms, r.ID)
			client.Mu.Unlock()
			r.mu.Unlock()
		}
	}

	r.mu.RLock()
	if len(r.Clients) == 0 {
		r.mu.RUnlock()
		r.hub.Mu.Lock()
		delete(r.hub.Rooms, r.ID)
		r.hub.Mu.Unlock()
		select {
			case r.destroy <- struct{}{}:
			default:
		}
	} else {
		r.mu.RUnlock()
	}
}

func (r *Room) Run() {
	for {
		select {
			case client := <-r.Join:
				r.mu.Lock()
				r.Clients[client] = true
				client.Mu.Lock()
				client.Rooms[r.ID] = r
				log.Printf("Client %s joined room %s", client.Username, r.Name)
				client.Mu.Unlock()
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
					client.Mu.Lock()
					delete(client.Rooms, r.ID)
					client.Mu.Unlock()

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

					r.mu.RLock()
					if len(r.Clients) == 0 {
						log.Printf("Room %s is empty, destroying...", r.Name)
						r.mu.RUnlock()
						r.hub.Mu.Lock()
						delete(r.hub.Rooms, r.ID)
						r.hub.Mu.Unlock()
						return
					}
					r.mu.RUnlock()
				} else {
					r.mu.Unlock()
				}

			case <-r.destroy:
				return

			case message := <-r.Broadcast:
				log.Printf("Room %s is empty, destroying...", r.Name)
				r.broadcast(message)
		}
	}
}
