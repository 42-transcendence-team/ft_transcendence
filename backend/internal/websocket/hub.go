package websocket

import (
	"fmt"
	"log"
	"sync"
)

type Hub struct {
	Clients          map[*Client]bool          // Mapa de clientes conectados
	ClientsConnected map[uint]map[*Client]bool // Conexiones por usuario (un usuario puede tener varias pestañas)
	Rooms            map[uint]*Room            // Mapa de salas de chat y sus clientes
	Register         chan *Client              // Canal para registrar nuevos clientes
	Unregister       chan *Client              // Canal para desregistrar clientes
	CloseRooms       chan uint                 // Canal para cerrar salas

	Mu sync.RWMutex // Mutex para proteger el acceso a los mapas
}

func NewHub() *Hub {
	return &Hub{
		Clients:          make(map[*Client]bool),
		ClientsConnected: make(map[uint]map[*Client]bool),
		Register:         make(chan *Client),
		Unregister:       make(chan *Client),
		Rooms:            make(map[uint]*Room),
		CloseRooms:       make(chan uint, 16),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			// Un mismo usuario puede tener varias conexiones abiertas (varias
			// pestañas del navegador). No se expulsa la conexión anterior: se
			// añade la nueva al set de conexiones del usuario.
			if h.ClientsConnected[client.UserID] == nil {
				h.ClientsConnected[client.UserID] = make(map[*Client]bool)
			}
			h.ClientsConnected[client.UserID][client] = true
			h.Clients[client] = true
			h.Mu.Unlock()

		case client := <-h.Unregister:
			h.Mu.Lock()
			// Se elimina el cliente del set de su usuario. Solo se borra la
			// clave cuando ya no queda ninguna conexión de ese usuario.
			if conns, ok := h.ClientsConnected[client.UserID]; ok {
				delete(conns, client)
				if len(conns) == 0 {
					delete(h.ClientsConnected, client.UserID)
				}
			}
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
			}
			h.Mu.Unlock()

			client.Mu.RLock()
			for _, room := range client.Rooms {
				select {
				case room.Leave <- client:
				default:
				}
			}
			client.Mu.RUnlock()

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
		for client := range h.ClientsConnected[id] {
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

	for client := range h.ClientsConnected[userID] {
		select {
		case client.SendChan <- message:
		default:
		}
	}
}

func (h *Hub) BroadcastToRoom(roomID uint, message []byte) {
	h.Mu.RLock()
	room, ok := h.Rooms[roomID]
	h.Mu.RUnlock()
	if !ok {
		return
	}

	// Envío no bloqueante y SIN coger h.Mu: una sala vacía que se está
	// autodestruyendo puede dejar de leer room.Broadcast, y bloquear aquí
	// mientras se mantiene el RLock provocaría un deadlock con hub.Run.
	select {
	case room.Broadcast <- message:
	default:
	}
}

func (h *Hub) GetRoom(roomID uint) (*Room, bool) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	room, exists := h.Rooms[roomID]
	return room, exists
}
