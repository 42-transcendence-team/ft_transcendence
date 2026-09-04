package websocket

import (
	"testing"
	"time"
)

func TestMultipleConnectionsPerUser(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	c1 := NewClient(nil, hub, 42, "user1")
	c2 := NewClient(nil, hub, 42, "user1")
	c3 := NewClient(nil, hub, 43, "user2")

	hub.Register <- c1
	hub.Register <- c2
	hub.Register <- c3

	msg := []byte(`{"type":"test"}`)
	hub.SendMessagesToUser(42, msg)

	assertReceived(t, c1, msg, "cliente 1 del usuario 42")
	assertReceived(t, c2, msg, "cliente 2 del usuario 42")

	select {
	case got := <-c3.SendChan:
		t.Fatalf("usuario 43 no debería recibir el mensaje, recibió: %s", got)
	default:
	}

	hub.Unregister <- c1

	waitForUnregister(t, hub, c1)

	msg2 := []byte(`{"type":"test2"}`)
	hub.SendMessagesToUser(42, msg2)

	select {
	case got := <-c1.SendChan:
		t.Fatalf("cliente desregistrado no debería recibir, recibió: %s", got)
	default:
	}
	assertReceived(t, c2, msg2, "cliente 2 tras desregistro del cliente 1")

	hub.Unregister <- c2
	waitForUnregister(t, hub, c2)

	hub.SendMessagesToUser(42, msg2)
	hub.SendMessagesToUsers([]uint{42, 43}, msg2)

	assertReceived(t, c3, msg2, "usuario 43 tras fan-out")
}

func waitForUnregister(t *testing.T, hub *Hub, c *Client) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		hub.Mu.RLock()
		_, still := hub.ClientsConnected[c.UserID][c]
		hub.Mu.RUnlock()
		if !still {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("cliente %p no fue desregistrado a tiempo", c)
}

func assertReceived(t *testing.T, c *Client, expected []byte, label string) {
	t.Helper()
	select {
	case got := <-c.SendChan:
		if string(got) != string(expected) {
			t.Fatalf("%s: mensaje inesperado: %s", label, got)
		}
	case <-time.After(time.Second):
		t.Fatalf("%s: no recibió el mensaje", label)
	}
}
