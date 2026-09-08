package games

import (
	"backend/internal/dto"
	"sync"
	"testing"
)

func newTestGame(t *testing.T, maxPlayers uint) *TicTacToe {
	t.Helper()
	return NewTicTacToe(1, maxPlayers, "online", "TICTACTOE", make(chan dto.GameEvent, 10000))
}

// Verifica el fix #4: al reconectar a un juego online que aún no está lleno,
// no se añade un segundo Player duplicado con el mismo userID.
func TestConnectPlayerNoDuplicateOnReconnect(t *testing.T) {
	g := newTestGame(t, 2)

	if err := g.ConnectPlayer(100, "alice"); err != nil {
		t.Fatalf("ConnectPlayer: %v", err)
	}
	if got := len(g.GetPlayers()); got != 1 {
		t.Fatalf("esperaba 1 jugador, got %d", got)
	}

	if err := g.DisconnectPlayer(100); err != nil {
		t.Fatalf("DisconnectPlayer: %v", err)
	}
	if got := len(g.GetPlayers()); got != 1 {
		t.Fatalf("desconectar debe conservar el slot, got %d jugadores", got)
	}

	// Reconexión tras un takeover: debe reconectar, no duplicar.
	if err := g.ConnectPlayer(100, "alice"); err != nil {
		t.Fatalf("ConnectPlayer (reconnect): %v", err)
	}
	players := g.GetPlayers()
	if got := len(players); got != 1 {
		t.Fatalf("la reconexión no debería duplicar el jugador, got %d", got)
	}
	if !players[0].Connected {
		t.Fatal("el jugador debería quedar reconectado")
	}
}

// Verifica que un jugador nuevo sí se añade cuando el juego no está lleno.
func TestConnectPlayerNewPlayerWhenNotFull(t *testing.T) {
	g := newTestGame(t, 3)

	if err := g.ConnectPlayer(100, "alice"); err != nil {
		t.Fatalf("ConnectPlayer alice: %v", err)
	}
	if err := g.ConnectPlayer(200, "bob"); err != nil {
		t.Fatalf("ConnectPlayer bob: %v", err)
	}
	if got := len(g.GetPlayers()); got != 2 {
		t.Fatalf("esperaba 2 jugadores, got %d", got)
	}
}

// Verifica el fix #3: IsPlayerConnected devuelve el estado correcto.
func TestIsPlayerConnected(t *testing.T) {
	g := newTestGame(t, 2)

	if err := g.ConnectPlayer(100, "alice"); err != nil {
		t.Fatalf("ConnectPlayer: %v", err)
	}
	if !g.IsPlayerConnected(100) {
		t.Fatal("alice debería estar conectada")
	}

	if err := g.DisconnectPlayer(100); err != nil {
		t.Fatalf("DisconnectPlayer: %v", err)
	}
	if g.IsPlayerConnected(100) {
		t.Fatal("alice debería estar desconectada")
	}
	if g.IsPlayerConnected(999) {
		t.Fatal("un usuario desconocido no debería estar conectado")
	}
}

// Verifica el fix #3: IsPlayerConnected es thread-safe cuando se lee de forma
// concurrente con DisconnectPlayer/ConnectPlayer. Debe pasar con -race.
func TestIsPlayerConnectedConcurrent(t *testing.T) {
	g := newTestGame(t, 4)

	if err := g.ConnectPlayer(100, "alice"); err != nil {
		t.Fatalf("ConnectPlayer: %v", err)
	}

	var wg sync.WaitGroup
	for i := 0; i < 4; i++ {
		wg.Add(2)
		go func() {
			defer wg.Done()
			for j := 0; j < 200; j++ {
				_ = g.IsPlayerConnected(100)
			}
		}()
		go func() {
			defer wg.Done()
			for j := 0; j < 200; j++ {
				_ = g.DisconnectPlayer(100)
				_ = g.ConnectPlayer(100, "alice")
			}
		}()
	}
	wg.Wait()
}
