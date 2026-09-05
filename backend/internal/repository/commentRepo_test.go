package repository

import (
	"backend/internal/models"
	"testing"
)

func TestCommentRepositoryCreateAndFindByID(t *testing.T) {
	db := newTestDB(t)
	commentRepo := NewCommentRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	comment := &models.Comment{PostID: post.ID, UserID: user.ID, Content: "nice"}
	created, err := commentRepo.Create(comment)
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if created.ID == 0 {
		t.Fatal("comment id must be assigned")
	}

	found, err := commentRepo.FindByID(created.ID)
	if err != nil {
		t.Fatalf("FindByID: %v", err)
	}
	if found.Content != "nice" {
		t.Fatalf("expected 'nice', got %q", found.Content)
	}
}

func TestCommentRepositoryListByPostID(t *testing.T) {
	db := newTestDB(t)
	commentRepo := NewCommentRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	_, _ = commentRepo.Create(&models.Comment{PostID: post.ID, UserID: user.ID, Content: "one"})
	_, _ = commentRepo.Create(&models.Comment{PostID: post.ID, UserID: user.ID, Content: "two"})

	comments, err := commentRepo.ListByPostID(post.ID)
	if err != nil {
		t.Fatalf("ListByPostID: %v", err)
	}
	if len(comments) != 2 {
		t.Fatalf("expected 2 comments, got %d", len(comments))
	}
}

func TestCommentRepositoryDelete(t *testing.T) {
	db := newTestDB(t)
	commentRepo := NewCommentRepository(db)

	user := seedUser(t, db, "author")
	post := seedPost(t, db, user.ID, "post")

	comment, _ := commentRepo.Create(&models.Comment{PostID: post.ID, UserID: user.ID, Content: "x"})

	rows, err := commentRepo.Delete(comment)
	if err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expected 1 row deleted, got %d", rows)
	}
}
