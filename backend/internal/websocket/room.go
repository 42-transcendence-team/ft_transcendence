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

	Broadcast    chan []byte
	hubCloseRoom chan uint
	mu           sync.RWMutex
}

func NewRoom(id uint, name string, private bool, hubCloseChan chan uint) *Room {
	return &Room{
		ID:           id,
		Name:         name,
		Private:      private,
		Clients:      make(map[*Client]bool),
		Join:         make(chan *Client),
		Leave:        make(chan *Client),
		Broadcast:    make(chan []byte),
		hubCloseRoom: hubCloseChan,
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
			r.mu.Unlock()
			joinMsg := client.Username + " se ha unido a la sala " + r.Name + "."
			msg, err := json.Marshal(joinMsg)
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
					continue
				}
				r.broadcast(msg)
			}
			if len(r.Clients) == 0 {
				r.mu.Unlock()

				log.Printf("Sala %d vacía. Iniciando proceso de autodestrucción...", r.ID)

				r.hubCloseRoom <- r.ID

				return
			}
			r.mu.Unlock()

		case message := <-r.Broadcast:
			r.broadcast(message)
		}
	}
}
