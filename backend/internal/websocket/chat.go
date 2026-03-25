package chat

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub manages active WebSocket clients per channel.
type Hub struct {
	clients    map[string]map[*Client]bool // channelID -> set<Client>
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
}

// Client represents a connected WebSocket user.
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	userID   string
	channels []string // ["dm:1:2", "room:789", "notif:1"]
}

// Message is the broadcast payload.
type Message struct {
	ChannelID string
	Data      []byte
}

// NewHub initializes and returns a Hub instance.
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan Message, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// --- Hub lifecycle ---

// NewHub initializes and returns a Hub instance.
func NewHub() *Hub

// Run starts the hub event loop (blocking, run as goroutine).
func (h *Hub) Run()

// --- Client lifecycle ---

// ServeWS upgrades HTTP→WS, fetches user channels from DB, registers client.
func ServeWS(hub *Hub, db *sql.DB, c *gin.Context)

// ReadPump reads from WS, parses channelID, forwards to hub broadcast.
func (c *Client) ReadPump()

// WritePump reads from hub send channel and writes to WS connection.
func (c *Client) WritePump()

// --- Channel management ---

// CreateRoom creates a new public room in DB, returns "room:{id}".
func CreateRoom(db *sql.DB, name string, ownerID string) (string, error)

// CreateDM creates a private channel between two users if not exists, returns "dm:{userA}:{userB}".
func CreateDM(db *sql.DB, userA string, userB string) (string, error)

// JoinChannel subscribes client to channelID in hub and DB.
func (c *Client) JoinChannel(channelID string)

// LeaveChannel unsubscribes client from channelID in hub and DB.
func (c *Client) LeaveChannel(channelID string)

// DeleteRoom removes room from DB and disconnects all members.
func DeleteRoom(db *sql.DB, hub *Hub, roomID string, requesterID string) error

// KickUser removes a user from a room, closes their WS subscription to that channel.
// Only executable by room owner.
func KickUser(db *sql.DB, hub *Hub, roomID string, targetID string, requesterID string) error

// BanUser permanently blocks a user from rejoining a room.
func BanUser(db *sql.DB, roomID string, targetID string, requesterID string) error

// --- Messages ---

// SaveMessage persists a message to PostgreSQL messages table.
func SaveMessage(db *sql.DB, msg Message) error

// DeleteMessage soft-deletes a message by ID (sets deleted_at).
// Only executable by sender or room owner.
func DeleteMessage(db *sql.DB, messageID string, requesterID string) error

// EditMessage updates message content and sets edited_at timestamp.
func EditMessage(db *sql.DB, messageID string, newContent string, requesterID string) error

// --- Reports ---

// ReportMessage creates a report entry for a message in DB.
func ReportMessage(db *sql.DB, messageID string, reporterID string, reason string) error

// ReportUser creates a report entry for a user in DB.
func ReportUser(db *sql.DB, targetID string, reporterID string, reason string) error

// --- Queries ---

// fetchUserChannels returns all channelIDs the user belongs to.
func fetchUserChannels(db *sql.DB, userID string) []string

// GetRoomMembers returns all userIDs in a room.
func GetRoomMembers(db *sql.DB, roomID string) ([]string, error)

// GetMessageHistory returns paginated messages for a channel.
// @param limit int    - page size
// @param before string - messageID cursor for pagination
func GetMessageHistory(db *sql.DB, channelID string, limit int, before string) ([]Message, error)
