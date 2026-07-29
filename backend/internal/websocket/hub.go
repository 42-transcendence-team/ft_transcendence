package websocket

import (
	"sync"
)

type Hub struct {
	Clients map[*Client]bool // Mapa de clientes conectados
	ClientsConnected map[uint]*Client// Mapa de clientes conectados
	Rooms   map[uint]*Room   // Mapa de salas de chat y sus clientes
	Register   chan *Client // Canal para registrar nuevos clientes
	Unregister chan *Client // Canal para desregistrar clientes
	Mu sync.RWMutex // Mutex para proteger el acceso a los mapas
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		ClientsConnected: make(map[uint]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Rooms:      make(map[uint]*Room),
	}
}

func (h *Hub) Run() {
	for {
		select {
			case client := <-h.Register:
				h.Mu.Lock()
				h.Clients[client] = true
				h.ClientsConnected[client.UserID] = client
				h.Mu.Unlock()

			case client := <-h.Unregister:
				h.Mu.Lock()
				_, ok := h.Clients[client]
				if ok {
					delete(h.Clients, client)
					delete(h.ClientsConnected, client.UserID)
				}
				h.Mu.Unlock()

				if ok {
					client.Mu.RLock()
					for _, room := range client.Rooms {
						select {
						case room.Leave <- client:
						default:
						}
					}
					client.Mu.RUnlock()
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

func (h *Hub) SendMessagesToUsers(userID []uint, message []byte) {
	h.Mu.RLock()
 	defer h.Mu.RUnlock()

	for _, id := range userID {
		if client, ok := h.ClientsConnected[id]; ok {
			// Envio no bloqueante: un cliente lento no debe congelar el hub
			select {
			case client.SendChan <- message:
			default:
			}
		}
	}
}

func (h *Hub) SendMessagesToUser(userID uint, message[] byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	if client, ok := h.ClientsConnected[userID]; ok {
		select {
		case client.SendChan <- message:
		default:
		}
	}
}

func (h *Hub) BroadcastAll(message []byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	for _, client := range h.ClientsConnected {
		select {
		case client.SendChan <- message:
		default:
		}
	}
}
