package websocket

import (
	"fmt"
	"log"
	"sync"
)

type Hub struct {
	Clients          map[*Client]bool // Mapa de clientes conectados
	ClientsConnected map[uint]*Client // Mapa de clientes conectados
	Rooms            map[uint]*Room   // Mapa de salas de chat y sus clientes
	Register         chan *Client     // Canal para registrar nuevos clientes
	Unregister       chan *Client     // Canal para desregistrar clientes
	CloseRooms       chan uint        // Canal para cerrar salas

	Mu sync.RWMutex // Mutex para proteger el acceso a los mapas
}

func NewHub() *Hub {
	return &Hub{
		Clients:          make(map[*Client]bool),
		ClientsConnected: make(map[uint]*Client),
		Register:         make(chan *Client),
		Unregister:       make(chan *Client),
		Rooms:            make(map[uint]*Room),
		CloseRooms:       make(chan uint),
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
			h.Mu.Unlock()
		case roomID := <-h.CloseRooms:
			h.Mu.Lock()
			if _, ok := h.Rooms[roomID]; ok {
				delete(h.Rooms, roomID)
				log.Printf("Sala %d cerrada y eliminada del Hub", roomID)
				var activeRooms []string
				for id, room := range h.Rooms {
					activeRooms = append(activeRooms, fmt.Sprintf("%d (%s)", id, room.Name))
				}

				if len(activeRooms) == 0 {
					log.Println("Salas actuales en el Hub: [Ninguna sala activa]")
				} else {
					log.Printf("Salas actuales en el Hub: %v", activeRooms)
				}
			}
			h.Mu.Unlock()

			// case client := <-h.Register:
			// 				h.Mu.Lock()
			// 				h.Clients[client] = true
			// 				h.ClientsConnected[client.UserID] = client
			// 				h.Mu.Unlock()

			// 			case client := <-h.Unregister:
			// 				h.Mu.Lock()
			// 				_, ok := h.Clients[client]
			// 				if ok {
			// 					delete(h.Clients, client)
			// 					delete(h.ClientsConnected, client.UserID)
			// 				}
			// 				h.Mu.Unlock()

			// 				if ok {
			// 					client.Mu.RLock()
			// 					for _, room := range client.Rooms {
			// 						select {
			// 						case room.Leave <- client:
			// 						default:
			// 						}
			// 					}
			// 					client.Mu.RUnlock()
		}
	}
}

func (h *Hub) CreateRoom(id uint, name string, private bool) *Room {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if _, exists := h.Rooms[id]; exists {
		return h.Rooms[id]
	}

	room := NewRoom(id, name, private, h.CloseRooms)
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

func (h *Hub) SendMessagesToUser(userID uint, message []byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	if client, ok := h.ClientsConnected[userID]; ok {
		select {
		case client.SendChan <- message:
		default:
		}
	}
}

func (h *Hub) BroadcastToRoom(roomID uint, message []byte) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	if room, ok := h.Rooms[roomID]; ok {
		room.Broadcast <- message
	}
}

func (h *Hub) GetRoom(roomID uint) (*Room, bool) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	room, exists := h.Rooms[roomID]
	return room, exists
}
