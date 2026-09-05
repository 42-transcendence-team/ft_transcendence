package repository

import (
	"backend/internal/models"
	"testing"
)

func TestPostLikeRepositorySetReactionAndUpdate(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostLikeRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	if err := repo.SetReaction(post.ID, user.ID, models.PostReactionLike); err != nil {
		t.Fatalf("set like: %v", err)
	}

	count, err := repo.CountByPostIDAndReaction(post.ID, models.PostReactionLike)
	if err != nil || count != 1 {
		t.Fatalf("expected 1 like, got %d (%v)", count, err)
	}

	// Same user changes to dislike (upsert, no duplicate row).
	if err := repo.SetReaction(post.ID, user.ID, models.PostReactionDislike); err != nil {
		t.Fatalf("set dislike: %v", err)
	}

	count, _ = repo.CountByPostIDAndReaction(post.ID, models.PostReactionDislike)
	if count != 1 {
		t.Fatalf("expected 1 dislike, got %d", count)
	}
	count, _ = repo.CountByPostIDAndReaction(post.ID, models.PostReactionLike)
	if count != 0 {
		t.Fatalf("expected 0 likes after change, got %d", count)
	}
}

func TestPostLikeRepositoryGetReactionByPostAndUser(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostLikeRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	_, exists, err := repo.GetReactionByPostAndUser(post.ID, user.ID)
	if err != nil {
		t.Fatalf("get reaction: %v", err)
	}
	if exists {
		t.Fatal("reaction must not exist initially")
	}

	_ = repo.SetReaction(post.ID, user.ID, models.PostReactionLike)
	reaction, exists, err := repo.GetReactionByPostAndUser(post.ID, user.ID)
	if err != nil || !exists {
		t.Fatalf("expected reaction to exist, got %v, %v", exists, err)
	}
	if reaction != models.PostReactionLike {
		t.Fatalf("expected like reaction, got %d", reaction)
	}
}

func TestPostLikeRepositoryCountGroupedByPostIDs(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostLikeRepository(db)

	u1 := seedUser(t, db, "u1")
	u2 := seedUser(t, db, "u2")
	post := seedPost(t, db, u1.ID, "post")

	_ = repo.SetReaction(post.ID, u1.ID, models.PostReactionLike)
	_ = repo.SetReaction(post.ID, u2.ID, models.PostReactionDislike)

	counts, err := repo.CountGroupedByPostIDs([]uint{post.ID})
	if err != nil {
		t.Fatalf("CountGroupedByPostIDs: %v", err)
	}

	entry, ok := counts[post.ID]
	if !ok {
		t.Fatalf("expected counts for post %d", post.ID)
	}
	if entry.LikeCount != 1 || entry.DislikeCount != 1 {
		t.Fatalf("expected 1 like and 1 dislike, got %+v", entry)
	}
}

func TestPostLikeRepositoryDeleteReaction(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostLikeRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	_ = repo.SetReaction(post.ID, user.ID, models.PostReactionLike)

	rows, err := repo.DeleteReaction(post.ID, user.ID, models.PostReactionLike)
	if err != nil {
		t.Fatalf("DeleteReaction: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expected 1 row deleted, got %d", rows)
	}
}
