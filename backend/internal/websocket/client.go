package websocket

import (
	"backend/internal/dto"
	"fmt"
	"log"
	"sync"
	"time"
	"github.com/gorilla/websocket"
)

type Client struct {
	Conn     *websocket.Conn // Conexión WebSocket del cliente
	SendChan chan []byte     // Canal para enviar mensajes al cliente

	Hub *Hub // Referencia al Hub para registrar/desregistrar clientes

	UserID   uint   // ID del usuario asociado al cliente
	Username string // Nombre de usuario del cliente
	Rooms map[uint]*Room // Salas a las que el cliente está unido
	Mu sync.RWMutex // Protege Rooms (se accede desde hub y desde las salas)

	// Reclaim indica que es una reconexión desde una ventana "standby" (la
	// vieja, bloqueada tras un takeover). En ese caso el hub NO expulsa a la
	// conexión activa; si hay sesión activa, se rechaza con 4002.
	Reclaim bool

	closeOnce sync.Once // Garantiza que SendChan solo se cierre una vez (kick de clientes lentos)
}

func NewClient(conn *websocket.Conn, hub *Hub, userID uint, username string) *Client {
	return &Client{
		Conn:     conn,
		SendChan: make(chan []byte, 256),
		Hub:      hub,
		UserID:   userID,
		Username: username,
		Rooms:    make(map[uint]*Room),
		
	}
}

const (
	writeWait      = 10 * time.Second    // Tiempo permitido para escribir un mensaje
	pongWait       = 60 * time.Second    // Tiempo permitido para recibir el pong
	pingPeriod     = (pongWait * 9) / 10 // Enviar pings un poco antes del timeout
	maxMessageSize = 1024                 // Tamaño máximo de mensaje
)

type ClientConn interface {
	Send([]byte)
	SendMessage(roomID uint, message []byte) error
	JoinRoom(*Room)
	LeaveRoom(*Room)
	GetUserID() uint
	GetUsername() string
}

func (c *Client) GetUserID() uint {
	return c.UserID
}

func (c *Client) GetUsername() string {
	return c.Username
}

func (c *Client) Send(message []byte) {
	select {
	case c.SendChan <- message:
	default:
		// Canal lleno o cerrado: se descarta el mensaje para no bloquear ni panicar.
	}
}

// closeSendChan cierra SendChan exactamente una vez. El WritePump detecta el
// cierre (ok == false), envía un CloseMessage y cierra la conexión TCP. Usar
// sync.Once evita el panic de doble close cuando varias salas expulsan al
// mismo cliente lento.
func (c *Client) closeSendChan() {
	c.closeOnce.Do(func() {
		close(c.SendChan)
	})
}

func (c *Client) JoinRoom(room *Room) {
	select {
	case room.Join <- c:
	default:
		// La sala está muriendo o ya se destruyó: no bloquear al ReadPump.
	}
}

func (c *Client) LeaveRoom(room *Room) {
	select {
	case room.Leave <- c:
	default:
	}
}

func (c *Client) SendMessage(roomID uint, message []byte) error {
	c.Hub.Mu.RLock()
	room, ok := c.Hub.Rooms[roomID]
	c.Hub.Mu.RUnlock()
	if !ok {
		return fmt.Errorf("send message Room with ID %d doesn't exists", roomID)
	}

	select {
	case room.Broadcast <- message:
	default:
	}
	return nil
}

func (c *Client) ReadPump(handler func(ClientConn, *dto.IncomingMessage)) {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))

	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		log.Printf("Received pong from client %s (ID: %d)", c.Username, c.UserID)
		return nil
	})

	for {
		var msg dto.IncomingMessage

		if err := c.Conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseNormalClosure,
				websocket.CloseGoingAway,
				websocket.CloseNoStatusReceived,
			) {
				log.Printf("WebSocket Read Error: %v", err)
			}
			break
		}

		handler(c, &msg)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.SendChan:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))

			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			log.Printf("Sending ping to client %s (ID: %d)", c.Username, c.UserID)
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))

			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
