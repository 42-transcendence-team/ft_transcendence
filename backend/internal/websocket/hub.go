package websocket

import (
	"sync"
	"gorm.io/gorm"
)

type Hub struct {
	Clients map[*Client]bool // Mapa de clientes conectados
	ClientsConnected map[uint]*Client// Mapa de clientes conectados
	Rooms   map[uint]*Room   // Mapa de salas de chat y sus clientes
	Register   chan *Client // Canal para registrar nuevos clientes
	Unregister chan *Client // Canal para desregistrar clientes
	db *gorm.DB
	Mu sync.RWMutex // Mutex para proteger el acceso a los mapas
}

func NewHub(db *gorm.DB) *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		ClientsConnected: make(map[uint]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Rooms:      make(map[uint]*Room),
		db: db,
	}
}

func (h *Hub) Run() {
	for {
		select {
			case client := <-h.Register:
				h.Clients[client] = true
				h.ClientsConnected[client.UserID] = client

			case client := <-h.Unregister:
				if _, ok := h.Clients[client]; ok {
					for _, room := range h.Rooms {
						if _, ok := room.Clients[client]; ok {
							room.Leave <- client
						}
					}
					delete(h.Clients, client)
					delete(h.ClientsConnected, client.UserID)
					close(client.SendChan)
				}
			}
	}
}

func (h *Hub) CreateRoom(id uint, name string, private bool) *Room {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if _, exists := h.Rooms[id]; exists {
		return h.Rooms[id]
	}

	room := NewRoom(id, name, private, h)
	h.Rooms[id] = room
	go room.Run()
	return room
}

func (h *Hub) RemoveRoom(id uint) {
	h.Mu.Lock()
	defer h.Mu.Unlock()
	delete(h.Rooms, id)
}


/*
h.hub.SendNotification(req.Users, m)
*/
func (h *Hub) SendMessagesToUsers(userID []uint, message []byte) {
	h.Mu.RLock()
 	defer h.Mu.RUnlock()
	
	for _, id := range userID {
		if client, ok := h.ClientsConnected[id]; ok {
			client.SendChan <- message
		}
	}
}

func (h *Hub) SendMessagesToUser(userID uint, message[] byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	if client, ok := h.ClientsConnected[userID]; ok {
		client.SendChan <- message
	}
}
