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

	Broadcast    chan []byte
	hubCloseRoom chan uint
}

func NewRoom(id uint, name string, private bool, hubCloseChan chan uint) *Room {
	return &Room{
		ID:           id,
		Name:         name,
		Private:      private,
		Clients:      make(map[*Client]bool),
		Join:         make(chan *Client, 1),
		Leave:        make(chan *Client, 1),
		Broadcast:    make(chan []byte, 32),
		hubCloseRoom: hubCloseChan,
	}
}

// broadcast se ejecuta SIEMPRE dentro de la goroutine de room.Run, por lo que
// no necesita lock sobre r.Clients. Si el canal de un cliente está lleno, el
// cliente es demasiado lento: se le expulsa de la sala y se cierra su SendChan
// para que el WritePump termine la conexión.
func (r *Room) broadcast(message []byte) {
	for client := range r.Clients {
		select {
		case client.SendChan <- message:
		default:
			delete(r.Clients, client)
			client.Mu.Lock()
			delete(client.Rooms, r.ID)
			client.Mu.Unlock()
			client.closeSendChan()
		}
	}
}

func (r *Room) Run() {
	for {
		select {
		case client := <-r.Join:
			r.Clients[client] = true
			client.Mu.Lock()
			client.Rooms[r.ID] = r
			client.Mu.Unlock()

			joinMsg := map[string]any{
				"type":    "system",
				"content": client.Username + " se ha unido a la sala " + r.Name + ".",
			}
			msg, err := json.Marshal(joinMsg)
			if err != nil {
				log.Printf("Error marshaling join message: %v", err)
				continue
			}
			r.broadcast(msg)

		case client := <-r.Leave:
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
				} else {
					// r.broadcast nunca debe llamarse con el lock cogido:
					// dentro de él se hace closeSendChan y se toca client.Mu.
					r.broadcast(msg)
				}
			}

			if len(r.Clients) == 0 {
				log.Printf("Sala %d vacía. Iniciando proceso de autodestrucción...", r.ID)
				r.hubCloseRoom <- r.ID
				return
			}

		case message := <-r.Broadcast:
			r.broadcast(message)
		}
	}
}
