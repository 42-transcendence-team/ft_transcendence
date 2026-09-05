package websocket

import (
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"backend/internal/dto"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// startTestServer levanta un Hub real y un servidor HTTP que hace upgrade a WS.
func startTestServer(t *testing.T) (*Hub, string, func()) {
	t.Helper()

	hub := NewHub()
	go hub.Run()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		userID, _ := strconv.ParseUint(r.URL.Query().Get("user"), 10, 32)
		client := NewClient(conn, hub, uint(userID), r.URL.Query().Get("username"))

		hub.Register <- client
		go client.WritePump()
		go client.ReadPump(func(c ClientConn, msg *dto.IncomingMessage) {})
	}))

	cleanup := func() { srv.Close() }
	return hub, "ws" + srv.URL[len("http"):], cleanup
}

func dialUser(t *testing.T, wsURL, user, username string) *websocket.Conn {
	t.Helper()
	conn, _, err := websocket.DefaultDialer.Dial(wsURL+"?user="+user+"&username="+username, nil)
	if err != nil {
		t.Fatalf("dial %s: %v", user, err)
	}
	return conn
}

func TestHubSendToUser(t *testing.T) {
	hub, wsURL, cleanup := startTestServer(t)
	defer cleanup()

	c1 := dialUser(t, wsURL, "1", "alice")
	defer c1.Close()
	c2 := dialUser(t, wsURL, "2", "bob")
	defer c2.Close()

	// Wait for registration to propagate.
	time.Sleep(50 * time.Millisecond)

	hub.SendMessagesToUser(1, []byte("hello alice"))

	_ = c1.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := c1.ReadMessage()
	if err != nil {
		t.Fatalf("read for user 1: %v", err)
	}
	if string(msg) != "hello alice" {
		t.Fatalf("expected 'hello alice', got %q", string(msg))
	}

	// User 2 must not receive it.
	_ = c2.SetReadDeadline(time.Now().Add(200 * time.Millisecond))
	if _, _, err := c2.ReadMessage(); err == nil {
		t.Fatal("user 2 must not receive a message addressed to user 1")
	}
}

func TestHubSessionTakeoverClosesPreviousConnection(t *testing.T) {
	_, wsURL, cleanup := startTestServer(t)
	defer cleanup()

	c1 := dialUser(t, wsURL, "7", "carol")
	defer c1.Close()

	time.Sleep(50 * time.Millisecond)

	// Same user opens a new connection -> the previous one is closed.
	c2 := dialUser(t, wsURL, "7", "carol")
	defer c2.Close()

	_ = c1.SetReadDeadline(time.Now().Add(2 * time.Second))
	if _, _, err := c1.ReadMessage(); err == nil {
		t.Fatal("expected the previous connection to be closed")
	}
}

func TestRoomJoinAndBroadcast(t *testing.T) {
	hub, wsURL, cleanup := startTestServer(t)
	defer cleanup()

	c1 := dialUser(t, wsURL, "1", "alice")
	defer c1.Close()
	c2 := dialUser(t, wsURL, "2", "bob")
	defer c2.Close()

	time.Sleep(50 * time.Millisecond)

	room := hub.CreateRoom(42, "general", false)

	// Clients join the room through the hub's registered clients.
	hub.Mu.RLock()
	cl1 := hub.ClientsConnected[1]
	cl2 := hub.ClientsConnected[2]
	hub.Mu.RUnlock()
	if cl1 == nil || cl2 == nil {
		t.Fatal("clients must be registered")
	}

	cl1.JoinRoom(room)
	time.Sleep(50 * time.Millisecond)
	cl2.JoinRoom(room)
	time.Sleep(100 * time.Millisecond)

	hub.BroadcastToRoom(42, []byte("broadcast"))

	readUntil(t, c1, "broadcast")
	readUntil(t, c2, "broadcast")
}

// readUntil lee mensajes del WebSocket hasta encontrar el objetivo, drenando
// los mensajes de sistema previos (por ejemplo, los de unirse a la sala).
func readUntil(t *testing.T, conn *websocket.Conn, target string) {
	t.Helper()

	deadline := time.Now().Add(3 * time.Second)
	for {
		_ = conn.SetReadDeadline(deadline)
		_, msg, err := conn.ReadMessage()
		if err != nil {
			t.Fatalf("read until %q: %v", target, err)
		}
		if string(msg) == target {
			return
		}
	}
}

func TestRoomAutoDestroyWhenEmpty(t *testing.T) {
	hub, wsURL, cleanup := startTestServer(t)
	defer cleanup()

	c1 := dialUser(t, wsURL, "1", "alice")
	defer c1.Close()

	time.Sleep(50 * time.Millisecond)

	room := hub.CreateRoom(99, "private", true)

	hub.Mu.RLock()
	cl1 := hub.ClientsConnected[1]
	hub.Mu.RUnlock()
	cl1.JoinRoom(room)

	time.Sleep(100 * time.Millisecond)

	cl1.LeaveRoom(room)

	// The room should self-destroy once empty and be removed from the hub.
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		hub.Mu.RLock()
		_, exists := hub.Rooms[99]
		hub.Mu.RUnlock()
		if !exists {
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("room must be removed from hub after becoming empty")
}
