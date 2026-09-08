package websocket

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

// newWSPair crea un par de conexiones websocket conectadas (servidor + cliente)
// y devuelve (connServidor, connCliente). El servidor lee en bucle hasta que la
// conexión se cierra.
func newWSPair(t *testing.T) (*websocket.Conn, *websocket.Conn) {
	t.Helper()
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	serverConnCh := make(chan *websocket.Conn, 1)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		serverConnCh <- conn
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}))
	t.Cleanup(srv.Close)

	url := "ws" + strings.TrimPrefix(srv.URL, "http")
	client, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		t.Fatalf("dial failed: %v", err)
	}
	t.Cleanup(func() { client.Close() })

	server := <-serverConnCh
	return server, client
}

func waitFor(t *testing.T, timeout time.Duration, cond func() bool, msg string) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("timeout waiting for %s", msg)
}

// Verifica el fix #1 (takeover): al registrar una conexión nueva para el mismo
// usuario, la conexión anterior recibe un close frame con código 4001 y el hub
// sigue procesando registros.
func TestHubTakeoverClosesPreviousWith4001(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	serverA, clientA := newWSPair(t)
	serverB, _ := newWSPair(t)

	client1 := NewClient(serverA, hub, 42, "alice")
	client2 := NewClient(serverB, hub, 42, "alice")

	hub.Register <- client1
	hub.Register <- client2

	clientA.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, _, err := clientA.ReadMessage()
	if err == nil {
		t.Fatal("la conexión anterior debería cerrarse")
	}
	ce, ok := err.(*websocket.CloseError)
	if !ok {
		t.Fatalf("esperaba *websocket.CloseError, got %T: %v", err, err)
	}
	if ce.Code != 4001 {
		t.Fatalf("esperaba close code 4001, got %d", ce.Code)
	}

	// El hub debe seguir procesando registros (no quedó bloqueado).
	serverC, _ := newWSPair(t)
	client3 := NewClient(serverC, hub, 43, "bob")
	hub.Register <- client3

	waitFor(t, time.Second, func() bool {
		hub.Mu.RLock()
		defer hub.Mu.RUnlock()
		_, ok := hub.ClientsConnected[43]
		return ok
	}, "client3 registrado")
}

// Verifica la rama de reclaim (4002): una reconexión desde una ventana standby
// con sesión activa es rechazada y no expulsa a la conexión activa.
func TestHubReclaimRejectedWith4002(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	serverA, _ := newWSPair(t)
	serverB, clientB := newWSPair(t)

	client1 := NewClient(serverA, hub, 42, "alice")
	client2 := NewClient(serverB, hub, 42, "alice")
	client2.Reclaim = true

	hub.Register <- client1
	hub.Register <- client2

	clientB.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, _, err := clientB.ReadMessage()
	if err == nil {
		t.Fatal("la conexión reclaim debería rechazarse")
	}
	ce, ok := err.(*websocket.CloseError)
	if !ok {
		t.Fatalf("esperaba *websocket.CloseError, got %T: %v", err, err)
	}
	if ce.Code != 4002 {
		t.Fatalf("esperaba close code 4002, got %d", ce.Code)
	}

	// La conexión activa sigue registrada.
	waitFor(t, time.Second, func() bool {
		hub.Mu.RLock()
		defer hub.Mu.RUnlock()
		stored, ok := hub.ClientsConnected[42]
		return ok && stored == client1
	}, "client1 sigue activo")
}
