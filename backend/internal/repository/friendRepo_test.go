package repository

import (
	"backend/internal/models"
	"errors"
	"testing"

	"gorm.io/gorm"
)

func TestFriendRepositorySendAndAreFriends(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	req, err := repo.SendFriendRequest(a.ID, b.ID)
	if err != nil {
		t.Fatalf("send request: %v", err)
	}
	if req.Status != models.RelationPending {
		t.Fatalf("expected pending, got %q", req.Status)
	}

	friends, err := repo.AreFriends(a.ID, b.ID)
	if err != nil {
		t.Fatalf("AreFriends: %v", err)
	}
	if friends {
		t.Fatal("must not be friends before accepting")
	}

	if err := repo.BuildFriendship(*req); err != nil {
		t.Fatalf("build friendship: %v", err)
	}

	friends, err = repo.AreFriends(a.ID, b.ID)
	if err != nil {
		t.Fatalf("AreFriends: %v", err)
	}
	if !friends {
		t.Fatal("must be friends after accepting")
	}
	// Normalized order (min, max) must work both directions.
	friends, err = repo.AreFriends(b.ID, a.ID)
	if err != nil || !friends {
		t.Fatalf("friendship must be symmetric, got %v, %v", friends, err)
	}
}

func TestFriendRepositoryAreFriendsNotFriends(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	friends, err := repo.AreFriends(a.ID, b.ID)
	if err != nil {
		t.Fatalf("AreFriends: %v", err)
	}
	if friends {
		t.Fatal("expected not friends")
	}
}

func TestFriendRepositoryBlockAndAreBlock(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	if err := repo.CreateBlock(a.ID, b.ID); err != nil {
		t.Fatalf("create block: %v", err)
	}

	blocked, err := repo.AreBlock(a.ID, b.ID)
	if err != nil {
		t.Fatalf("AreBlock: %v", err)
	}
	if !blocked {
		t.Fatal("expected blocked")
	}
	// Bidirectional check.
	blocked, err = repo.AreBlock(b.ID, a.ID)
	if err != nil || !blocked {
		t.Fatalf("block must be symmetric, got %v, %v", blocked, err)
	}
}

func TestFriendRepositoryCreateBlockDuplicate(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	if err := repo.CreateBlock(a.ID, b.ID); err != nil {
		t.Fatalf("first block: %v", err)
	}
	if err := repo.CreateBlock(a.ID, b.ID); !errors.Is(err, gorm.ErrDuplicatedKey) {
		t.Fatalf("expected duplicated key on second block, got %v", err)
	}
}

func TestFriendRepositoryDeleteBlock(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	_ = repo.CreateBlock(a.ID, b.ID)
	if err := repo.DeleteBlock(a.ID, b.ID); err != nil {
		t.Fatalf("delete block: %v", err)
	}
	if err := repo.DeleteBlock(a.ID, b.ID); !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Fatalf("expected not found, got %v", err)
	}
}

func TestFriendRepositoryHasPendingRequest(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	_, _ = repo.SendFriendRequest(a.ID, b.ID)

	pending, err := repo.HasPendingRequestBetweenUsers(a.ID, b.ID)
	if err != nil || !pending {
		t.Fatalf("expected pending request, got %v, %v", pending, err)
	}
	// Symmetric.
	pending, err = repo.HasPendingRequestBetweenUsers(b.ID, a.ID)
	if err != nil || !pending {
		t.Fatalf("expected pending request (reverse), got %v, %v", pending, err)
	}
}

func TestFriendRepositoryListIncomingAndOutgoing(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	_, _ = repo.SendFriendRequest(a.ID, b.ID)

	outgoing, err := repo.ListOutgoingRequests(a.ID)
	if err != nil || len(outgoing) != 1 {
		t.Fatalf("expected 1 outgoing, got %d (%v)", len(outgoing), err)
	}

	incoming, err := repo.ListIncomingRequests(b.ID)
	if err != nil || len(incoming) != 1 {
		t.Fatalf("expected 1 incoming, got %d (%v)", len(incoming), err)
	}
}

func TestFriendRepositoryRejectRequest(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	req, _ := repo.SendFriendRequest(a.ID, b.ID)
	if err := repo.RejectFriendRequest(req.ID); err != nil {
		t.Fatalf("reject: %v", err)
	}

	status, err := repo.GetReqStatus(a.ID, b.ID)
	if err != nil {
		t.Fatalf("GetReqStatus: %v", err)
	}
	if status != models.RelationRejected {
		t.Fatalf("expected rejected, got %q", status)
	}
}

func TestFriendRepositoryListFriendsAndDelete(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	req, _ := repo.SendFriendRequest(a.ID, b.ID)
	_ = repo.BuildFriendship(*req)

	friends, err := repo.ListFriends(a.ID)
	if err != nil || len(friends) != 1 {
		t.Fatalf("expected 1 friendship, got %d (%v)", len(friends), err)
	}

	if err := repo.DeleteFriendship(a.ID, b.ID); err != nil {
		t.Fatalf("delete friendship: %v", err)
	}
	if err := repo.DeleteFriendship(a.ID, b.ID); !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Fatalf("expected not found, got %v", err)
	}
}

func TestFriendRepositoryDeletePendingRequestsBetweenUsers(t *testing.T) {
	db := newTestDB(t)
	repo := NewFriendRepository(db)

	a := seedUser(t, db, "a")
	b := seedUser(t, db, "b")

	_, _ = repo.SendFriendRequest(a.ID, b.ID)
	if err := repo.DeletePendingRequestsBetweenUsers(a.ID, b.ID); err != nil {
		t.Fatalf("delete pending: %v", err)
	}

	pending, _ := repo.HasPendingRequestBetweenUsers(a.ID, b.ID)
	if pending {
		t.Fatal("expected no pending request after delete")
	}
}
