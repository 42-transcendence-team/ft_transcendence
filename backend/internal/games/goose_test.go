package games

import (
	"backend/internal/dto"
	"testing"
)

func newGoose(players uint, mode string) *Goose {
	return NewGoose(1, players, mode, "goose", make(chan dto.GameEvent, 10))
}

func TestGooseBoardSetup(t *testing.T) {
	g := newGoose(2, "local")

	if len(g.Board) != 64 {
		t.Fatalf("expected 64 cells, got %d", len(g.Board))
	}

	if g.Board[5].Type != CellGoose {
		t.Fatalf("cell 5 must be goose")
	}
	if g.Board[6].Type != CellBridge {
		t.Fatalf("cell 6 must be bridge")
	}
	if g.Board[19].Type != CellInn {
		t.Fatalf("cell 19 must be inn")
	}
	if g.Board[31].Type != CellWell {
		t.Fatalf("cell 31 must be well")
	}
	if g.Board[26].Type != CellDice {
		t.Fatalf("cell 26 must be dice")
	}
	if g.Board[42].Type != CellMaze {
		t.Fatalf("cell 42 must be maze")
	}
	if g.Board[56].Type != CellPrison {
		t.Fatalf("cell 56 must be prison")
	}
	if g.Board[58].Type != CellSkull {
		t.Fatalf("cell 58 must be skull")
	}
}

func TestGooseConnectPlayerCreatesState(t *testing.T) {
	g := newGoose(2, "online")
	if err := g.ConnectPlayer(10, "player10"); err != nil {
		t.Fatalf("connect player: %v", err)
	}

	state, ok := g.State[10]
	if !ok {
		t.Fatal("player state must exist after connect")
	}
	if state.Position != 0 {
		t.Fatalf("expected position 0, got %d", state.Position)
	}
}

func TestGooseNextGoose(t *testing.T) {
	g := newGoose(2, "local")
	// From 5, next goose is 9
	if got := g.NextGoose(5); got != 9 {
		t.Fatalf("expected next goose 9, got %d", got)
	}
	// From 63 (last goose), stays
	if got := g.NextGoose(63); got != 63 {
		t.Fatalf("expected stay at 63, got %d", got)
	}
}

func TestGooseMovePlayerBounce(t *testing.T) {
	g := newGoose(2, "local")
	state := g.State[1]
	state.Position = 60

	g.MovePlayer(1, 10) // 60 + 10 = 70 > 63 -> bounce to 63 - (70-63) = 56
	if state.Position != 56 {
		t.Fatalf("expected bounce to 56, got %d", state.Position)
	}
}

func TestGooseResolveBridge(t *testing.T) {
	g := newGoose(2, "local")
	actions := []GooseAction{}
	state := g.State[1]
	state.Position = 6

	extra := g.ResolveCell(1, &actions)
	if !extra {
		t.Fatal("bridge must allow extra action")
	}
	if state.Position != 12 {
		t.Fatalf("expected move to 12, got %d", state.Position)
	}
}

func TestGooseResolveSkull(t *testing.T) {
	g := newGoose(2, "local")
	actions := []GooseAction{}
	state := g.State[1]
	state.Position = 58

	extra := g.ResolveCell(1, &actions)
	if extra {
		t.Fatal("skull must end the move")
	}
	if state.Position != 1 {
		t.Fatalf("expected reset to 1, got %d", state.Position)
	}
}

func TestGooseResolveMaze(t *testing.T) {
	g := newGoose(2, "local")
	actions := []GooseAction{}
	state := g.State[1]
	state.Position = 42

	g.ResolveCell(1, &actions)
	if state.Position != 30 {
		t.Fatalf("expected maze to 30, got %d", state.Position)
	}
}

func TestGooseResolveWellAndPrison(t *testing.T) {
	g := newGoose(2, "local")
	actions := []GooseAction{}

	state := g.State[1]
	state.Position = 31
	g.ResolveCell(1, &actions)
	if !state.InWell {
		t.Fatal("player must be in well")
	}

	state2 := g.State[2]
	state2.Position = 56
	g.ResolveCell(2, &actions)
	if !state2.InPrison {
		t.Fatal("player must be in prison")
	}
}

func TestGooseRescueFromWell(t *testing.T) {
	g := newGoose(2, "local")

	wellState := g.State[1]
	wellState.InWell = true
	// Player 2 lands on 31 (the well), rescuing player 1
	g.checkRescue(2, 31)

	if wellState.InWell {
		t.Fatal("player 1 must be rescued from the well")
	}
}

func TestGooseRollDiceSkipTurn(t *testing.T) {
	g := newGoose(2, "local")
	state := g.State[1]
	state.SkipTurns = 1

	actions := g.RollDice(1)
	if len(actions) != 1 || actions[0].Type != "skip_turn" {
		t.Fatalf("expected skip_turn action, got %+v", actions)
	}
	if state.SkipTurns != 0 {
		t.Fatalf("expected skip turns decremented, got %d", state.SkipTurns)
	}
}

func TestGooseRollDiceWhileInWell(t *testing.T) {
	g := newGoose(2, "local")
	state := g.State[1]
	state.InWell = true

	actions := g.RollDice(1)
	if len(actions) != 1 || actions[0].Type != "well" {
		t.Fatalf("expected well action, got %+v", actions)
	}
}
