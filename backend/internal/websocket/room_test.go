package websocket

import (
	"strings"
	"sync"
	"testing"
	"time"
)

func newTestRoom(t *testing.T, onClientLeft func(uint, uint)) *Room {
	t.Helper()
	hub := NewHub()
	room := NewRoom(1, "Game-1", false, hub.CloseRooms)
	room.OnClientLeft = onClientLeft
	go room.Run()
	return room
}

// readBroadcast lee un mensaje del canal de un cliente dentro de un timeout.
// Los mensajes de sistema (join/leave) se emiten por r.broadcast a cada
// cliente de la sala, así que observar el SendChan de un cliente presente nos
// permite sincronizar con la goroutine de room.Run sin tocar r.Clients.
func readBroadcast(t *testing.T, c *Client, timeout time.Duration) []byte {
	t.Helper()
	select {
	case msg := <-c.SendChan:
		return msg
	case <-time.After(timeout):
		t.Fatalf("timeout esperando broadcast en SendChan")
		return nil
	}
}

// Verifica el fix #2: una reincorporación dentro del periodo de gracia
// (p.ej. toma de sesión) cancela la salida diferida y NO dispara OnClientLeft.
func TestRoomDeferredClientLeftCancelledOnRejoin(t *testing.T) {
	var leftMu sync.Mutex
	var left []uint
	room := newTestRoom(t, func(roomID, userID uint) {
		leftMu.Lock()
		left = append(left, userID)
		leftMu.Unlock()
	})

	alice := NewClient(nil, nil, 100, "alice")
	bob := NewClient(nil, nil, 200, "bob")
	alice2 := NewClient(nil, nil, 100, "alice")

	bob.JoinRoom(room)
	readBroadcast(t, bob, time.Second) // "bob se ha unido"
	alice.JoinRoom(room)
	readBroadcast(t, bob, time.Second) // "alice se ha unido"

	alice.LeaveRoom(room)
	// Deja que room.Run procese la salida y programe la salida diferida.
	time.Sleep(100 * time.Millisecond)

	// Reincorporación dentro de la gracia (como en la toma de sesión).
	alice2.JoinRoom(room)
	readBroadcast(t, bob, time.Second) // "alice se ha unido"

	time.Sleep(clientLeftGrace + 200*time.Millisecond)

	leftMu.Lock()
	defer leftMu.Unlock()
	if len(left) != 0 {
		t.Fatalf("OnClientLeft no debería dispararse tras una reincorporación, got %v", left)
	}
}

// Verifica el fix #2: si el usuario abandona de verdad (sin reincorporarse),
// OnClientLeft se dispara tras expirar el periodo de gracia.
func TestRoomDeferredClientLeftFiresOnGenuineLeave(t *testing.T) {
	var leftMu sync.Mutex
	var left []uint
	room := newTestRoom(t, func(roomID, userID uint) {
		leftMu.Lock()
		left = append(left, userID)
		leftMu.Unlock()
	})

	alice := NewClient(nil, nil, 100, "alice")
	bob := NewClient(nil, nil, 200, "bob")

	bob.JoinRoom(room)
	readBroadcast(t, bob, time.Second)
	alice.JoinRoom(room)
	readBroadcast(t, bob, time.Second)

	alice.LeaveRoom(room)
	// Deja que room.Run procese la salida y arranque el timer de gracia.
	time.Sleep(100 * time.Millisecond)

	time.Sleep(clientLeftGrace + 200*time.Millisecond)

	leftMu.Lock()
	defer leftMu.Unlock()
	if len(left) != 1 || left[0] != 100 {
		t.Fatalf("OnClientLeft debería dispararse una vez para el usuario 100, got %v", left)
	}
}

// Verifica el fix #2 en salas de chat: al no estar seteado OnClientLeft, la
// salida se anuncia inmediatamente (sin gracia).
func TestRoomChatLeaveImmediate(t *testing.T) {
	hub := NewHub()
	room := NewRoom(2, "Chat-2", false, hub.CloseRooms)
	go room.Run()

	alice := NewClient(nil, nil, 100, "alice")
	bob := NewClient(nil, nil, 200, "bob")

	bob.JoinRoom(room)
	readBroadcast(t, bob, time.Second)
	alice.JoinRoom(room)
	readBroadcast(t, bob, time.Second)

	alice.LeaveRoom(room)
	msg := readBroadcast(t, bob, time.Second)
	if !strings.Contains(string(msg), "abandonó") {
		t.Fatalf("esperaba mensaje de salida inmediato en un chat, got: %s", msg)
	}
}
