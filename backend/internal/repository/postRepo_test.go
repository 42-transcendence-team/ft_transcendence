package repository

import (
	"backend/internal/models"
	"testing"

	"gorm.io/gorm"
)

func seedPost(t *testing.T, db *gorm.DB, userID uint, content string) models.Post {
	t.Helper()
	post := models.Post{UserID: userID, Content: &content}
	if err := db.Create(&post).Error; err != nil {
		t.Fatalf("seed post: %v", err)
	}
	return post
}

func TestPostRepositoryCreateAndFindByID(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "my first post")

	found, err := repo.FindByID(post.ID)
	if err != nil {
		t.Fatalf("FindByID: %v", err)
	}
	if found.Content == nil || *found.Content != "my first post" {
		t.Fatalf("expected content, got %v", found.Content)
	}
}

func TestPostRepositoryListByUserID(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostRepository(db)

	user := seedUser(t, db, "author")
	_ = seedPost(t, db, user.ID, "post 1")
	_ = seedPost(t, db, user.ID, "post 2")

	posts, total, err := repo.ListByUserID(user.ID, 1, 10)
	if err != nil {
		t.Fatalf("ListByUserID: %v", err)
	}
	if len(posts) != 2 || total != 2 {
		t.Fatalf("expected 2 posts, got %d (total %d)", len(posts), total)
	}
}

func TestPostRepositoryListFeedForUserIncludesFriends(t *testing.T) {
	db := newTestDB(t)
	postRepo := NewPostRepository(db)
	friendRepo := NewFriendRepository(db)

	me := seedUser(t, db, "me")
	friend := seedUser(t, db, "friend")

	_ = seedPost(t, db, me.ID, "own post")
	_ = seedPost(t, db, friend.ID, "friend post")

	req, _ := friendRepo.SendFriendRequest(me.ID, friend.ID)
	_ = friendRepo.BuildFriendship(*req)

	posts, total, err := postRepo.ListFeedForUser(me.ID, 1, 10)
	if err != nil {
		t.Fatalf("ListFeedForUser: %v", err)
	}
	if total != 2 {
		t.Fatalf("expected 2 posts in feed, got %d", total)
	}
	if len(posts) != 2 {
		t.Fatalf("expected 2 posts, got %d", len(posts))
	}
}

func TestPostRepositoryListFeedByFriendships(t *testing.T) {
	db := newTestDB(t)
	postRepo := NewPostRepository(db)
	friendRepo := NewFriendRepository(db)

	me := seedUser(t, db, "me")
	friend := seedUser(t, db, "friend")
	stranger := seedUser(t, db, "stranger")

	_ = seedPost(t, db, friend.ID, "friend post")
	_ = seedPost(t, db, stranger.ID, "stranger post")

	req, _ := friendRepo.SendFriendRequest(me.ID, friend.ID)
	_ = friendRepo.BuildFriendship(*req)

	posts, total, err := postRepo.ListFeedByFriendships(me.ID, 1, 10)
	if err != nil {
		t.Fatalf("ListFeedByFriendships: %v", err)
	}
	// Only friends' posts, not own, not strangers.
	if total != 1 {
		t.Fatalf("expected 1 post from friend, got %d", total)
	}
	if len(posts) != 1 || posts[0].UserID != friend.ID {
		t.Fatalf("expected friend's post, got %+v", posts)
	}
}

func TestPostRepositoryDelete(t *testing.T) {
	db := newTestDB(t)
	repo := NewPostRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "to delete")

	rows, err := repo.Delete(&post)
	if err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expected 1 row deleted, got %d", rows)
	}
}
