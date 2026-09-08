package websocket

import (
	"encoding/json"
	"log"
	"time"
)

// clientLeftGrace es el periodo durante el cual, tras abandonar el último
// cliente de un usuario en una sala de juego, se espera a que otra conexión
// del mismo usuario (p.ej. una toma de sesión) se una y cancele la salida.
// Evita el parpadeo transitorio "RECONNECTING / abandonó la sala".
const clientLeftGrace = time.Second

// deferredLeave representa una salida de sala diferida: el cliente que se fue y
// el timer que disparará el aviso/OnClientLeft si no se reincorpora a tiempo.
type deferredLeave struct {
	client *Client
	timer  *time.Timer
}

type Room struct {
	ID      uint
	Name    string
	Private bool
	Clients map[*Client]bool

	Join  chan *Client
	Leave chan *Client

	Broadcast    chan []byte
	hubCloseRoom chan uint

	// clientLeftTimer avisa (desde una goroutine de time.AfterFunc) de que ha
	// expirado la gracia de salida de un usuario.
	clientLeftTimer chan uint
	// pendingLeft guarda las salidas diferidas pendientes por usuario. Solo se
	// toca desde la goroutine de room.Run (el callback solo envía a
	// clientLeftTimer), por lo que no necesita lock.
	pendingLeft map[uint]*deferredLeave

	// OnClientLeft se invoca (solo si está seteado, p.ej. en salas de juego)
	// cuando el último cliente de un usuario abandona la sala. Permite que el
	// motor del juego marque al jugador como desconectado y avise al resto de
	// que espere a que se reconecte.
	OnClientLeft func(roomID uint, userID uint)
}

func NewRoom(id uint, name string, private bool, hubCloseChan chan uint) *Room {
	return &Room{
		ID:              id,
		Name:            name,
		Private:         private,
		Clients:         make(map[*Client]bool),
		Join:            make(chan *Client, 1),
		Leave:           make(chan *Client, 1),
		Broadcast:       make(chan []byte, 32),
		hubCloseRoom:    hubCloseChan,
		clientLeftTimer: make(chan uint, 16),
		pendingLeft:     make(map[uint]*deferredLeave),
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

// hasClientWithUser comprueba si todavía queda algún cliente del mismo usuario
// en la sala. Se llama desde room.Run, que es el único sitio que modifica
// r.Clients, por lo que no necesita lock.
func (r *Room) hasClientWithUser(userID uint) bool {
	for c := range r.Clients {
		if c.UserID == userID {
			return true
		}
	}
	return false
}

func (r *Room) Run() {
	for {
		select {
		case client := <-r.Join:
			r.Clients[client] = true
			client.Mu.Lock()
			client.Rooms[r.ID] = r
			client.Mu.Unlock()

			// Una reincorporación (p.ej. toma de sesión) cancela la salida
			// diferida pendiente del mismo usuario para evitar el parpadeo.
			if dl, ok := r.pendingLeft[client.UserID]; ok {
				dl.timer.Stop()
				delete(r.pendingLeft, client.UserID)
			}

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

				if r.OnClientLeft != nil && !r.hasClientWithUser(client.UserID) {
					// Sala de juego y el usuario ya no está: se difiere el aviso
					// si aún queda otro cliente (rival) que pueda ver un parpadeo,
					// para dar tiempo a una toma de sesión / reconexión a entrar.
					if len(r.Clients) > 0 {
						r.deferClientLeft(client)
					} else {
						// La sala queda vacía: avisar y autodestruir como antes.
						r.broadcastLeave(client)
						r.OnClientLeft(r.ID, client.UserID)
					}
				} else {
					r.broadcastLeave(client)
				}
			}

			if len(r.Clients) == 0 {
				log.Printf("Sala %d vacía. Iniciando proceso de autodestrucción...", r.ID)
				r.hubCloseRoom <- r.ID
				return
			}

		case userID := <-r.clientLeftTimer:
			dl, ok := r.pendingLeft[userID]
			if !ok {
				continue
			}
			delete(r.pendingLeft, userID)

			// Si el usuario se reincorporó dentro de la gracia, no se avisa.
			if r.OnClientLeft != nil && !r.hasClientWithUser(userID) {
				r.broadcastLeave(dl.client)
				r.OnClientLeft(r.ID, userID)
			}

		case message := <-r.Broadcast:
			r.broadcast(message)
		}
	}
}

// broadcastLeave emite el mensaje de sistema "X abandonó la sala". Se llama
// desde room.Run, por lo que no necesita lock sobre r.Clients.
func (r *Room) broadcastLeave(client *Client) {
	leaveMsg := map[string]any{
		"type":    "system",
		"content": client.Username + " abandonó la sala.",
	}
	msg, err := json.Marshal(leaveMsg)
	if err != nil {
		log.Printf("Error marshaling leave message: %v", err)
		return
	}
	// r.broadcast nunca debe llamarse con el lock cogido:
	// dentro de él se hace closeSendChan y se toca client.Mu.
	r.broadcast(msg)
}

// deferClientLeft programa la salida diferida de un usuario. Si otra conexión
// del mismo usuario se une antes de expirar la gracia, se cancela (ver Join).
func (r *Room) deferClientLeft(client *Client) {
	if dl, ok := r.pendingLeft[client.UserID]; ok {
		dl.timer.Stop()
	}
	r.pendingLeft[client.UserID] = &deferredLeave{
		client: client,
		timer: time.AfterFunc(clientLeftGrace, func() {
			// El callback solo envía al canal; no toca r.pendingLeft.
			select {
			case r.clientLeftTimer <- client.UserID:
			default:
			}
		}),
	}
}
