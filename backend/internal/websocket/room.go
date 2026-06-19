package websocket

import (
	"encoding/json"
	"log"
)

type Room struct {
	ID      uint
	Name    string
	Private bool
	Clients map[*Client]bool

	Join  chan *Client
	Leave chan *Client

	Broadcast chan []byte
}

func NewRoom(id uint, name string, private bool) *Room {
	return &Room{
		ID:        id,
		Name:      name,
		Private:   private,
		Clients:   make(map[*Client]bool),
		Join:      make(chan *Client),
		Leave:     make(chan *Client),
		Broadcast: make(chan []byte),
	}
}

func (r *Room) broadcast(message []byte) {
	for client := range r.Clients {
		select {
		case client.SendChan <- message:
		default:
			close(client.SendChan)
			delete(r.Clients, client)
			delete(client.Rooms, r.ID)
		}
	}
}

func (r *Room) Run() {
	for {
		select {
			case client := <-r.Join:
				r.Clients[client] = true
				client.Rooms[r.ID] = r

				joinMsg := client.Username + " se ha unido a la sala."
				msg, err := json.Marshal(joinMsg)
				if err != nil {
					log.Printf("Error marshaling join message: %v", err)
					continue
				}
				r.broadcast(msg)

			case client := <-r.Leave:
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

			case message := <-r.Broadcast:
				r.broadcast(message)
		}
	}
}
