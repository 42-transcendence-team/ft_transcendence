package chat

import "fmt"

// Contiene a dónde va dirigido y el JSON del mensaje real.
type MessagePayload struct {
	Room string // "room_1" o "dm_5"
	Data []byte
}

// Subscription representa a un cliente que quiere unirse a una sala
type Subscription struct {
	Client *Client
	Room   string
}

type Hub struct {
	rooms map[string]map[*Client]bool // rooms mapea el nombre de una sala ("room_1") a un mapa de los clientes conectados a ella.

	broadcast   chan MessagePayload
	register    chan *Client
	unregister  chan *Client
	subscribe   chan Subscription
	unsubscribe chan Subscription
}

func NewHub() *Hub {
	return &Hub{
		broadcast:   make(chan MessagePayload),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		subscribe:   make(chan Subscription),
		unsubscribe: make(chan Subscription),
		rooms:       make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			// Solo lo registramos "generalmente", aún no está en ninguna sala
			// (Podrías guardar una lista global aquí si quisieras ver "quién está online en toda la app")
			_ = client

		case client := <-h.unregister:
			// Limpieza profunda: Cuando el WS se desconecta, hay que sacarlo de TODAS las salas
			for roomName, roomClients := range h.rooms {
				if _, ok := roomClients[client]; ok {
					delete(roomClients, client)
					// Si la sala se queda vacía, la borramos para ahorrar memoria
					if len(roomClients) == 0 {
						delete(h.rooms, roomName)
					}
				}
			}
			close(client.send)

		case sub := <-h.subscribe:
			// Crea la sala si no existe
			if h.rooms[sub.Room] == nil {
				h.rooms[sub.Room] = make(map[*Client]bool)
			}
			// Añade al cliente a la sala
			h.rooms[sub.Room][sub.Client] = true
			fmt.Printf("User %d se unió a %s\n", sub.Client.userID, sub.Room)

		case unsub := <-h.unsubscribe:
			// Saca al cliente de una sala específica
			if roomClients, ok := h.rooms[unsub.Room]; ok {
				if _, ok := roomClients[unsub.Client]; ok {
					delete(roomClients, unsub.Client)
					if len(roomClients) == 0 {
						delete(h.rooms, unsub.Room)
					}
				}
			}

		case payload := <-h.broadcast:
			// ¡El Enrutador en acción!
			// Busca la sala destino del mensaje y solo se lo envía a esa gente
			if roomClients, ok := h.rooms[payload.Room]; ok {
				for client := range roomClients {
					select {
					case client.send <- payload.Data:
					default:
						// Si el buffer del cliente está lleno (conexion atascada), lo kickeamos de la sala
						close(client.send)
						delete(roomClients, client)
					}
				}
			}
		}
	}
}
