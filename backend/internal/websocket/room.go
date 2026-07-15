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
				//if _, ok := r.Clients[client]; ok {
				//	log.Printf("hay cliente")
				// r.Clients[client] = false
				// delete(r.Clients, client)
				// delete(client.Rooms, r.ID)
				// log.Printf("xddddd %v", r.Clients)
				//}
				r.removeClient(r.ID, client.UserID)
				user, _ := r.ListUsers(r.ID)
				log.Printf("Usuarios en la sala %d: %v", r.ID, user)
				if len(user) == 0  {
					r.cleanup()
					return
				}
				// empty := len(r.Clients) == 0

				r.mu.Unlock()//parece que esta implementacion es mejor pero consume mucho, mirar bien lo de los usuarios conectados
				// if empty {
				// 	r.cleanup()
				// 	return
				// }
		}
	}
}

func (r *Room) removeClient(roomID uint, userID uint) {
    r.hub.db.Table("room_users").
        Where("chat_room_id = ? AND user_id = ?", roomID, userID).
        Delete(nil)
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
//query hechas 100% con IA, mirar bien anque parece que funcionan bien
func (r *Room) ListUsers(roomID uint) ([]models.User, error) {
	var users []models.User

    err := r.hub.db.Raw(`
        SELECT u.* 
        FROM users u 
        JOIN room_users ru ON ru.user_id = u.id 
        WHERE ru.chat_room_id = ?
    `, roomID).Scan(&users).Error
    
	return users, err
}
