package repository

import (
	"backend/internal/dto"
	"errors"
	"testing"

	"gorm.io/gorm"
)

func TestUserRepositoryCreateAndFindByLogin(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	user := seedUser(t, db, "alice")

	found, err := repo.FindByLogin("alice")
	if err != nil {
		t.Fatalf("FindByLogin: %v", err)
	}
	if found.ID != user.ID {
		t.Fatalf("expected ID %d, got %d", user.ID, found.ID)
	}
}

func TestUserRepositoryFindByLoginOrEmail(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "bob")

	if _, err := repo.FindByLoginOrEmail("bob"); err != nil {
		t.Fatalf("by login: %v", err)
	}
	if _, err := repo.FindByLoginOrEmail("bob@test.com"); err != nil {
		t.Fatalf("by email: %v", err)
	}
	if _, err := repo.FindByLoginOrEmail("nobody"); !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Fatalf("expected not found, got %v", err)
	}
}

func TestUserRepositoryFindByID(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	user := seedUser(t, db, "carol")

	found, err := repo.FindById(user.ID)
	if err != nil {
		t.Fatalf("FindById: %v", err)
	}
	if found.Login != "carol" {
		t.Fatalf("expected carol, got %q", found.Login)
	}
}

func TestUserRepositoryFilterByLogin(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "alice")
	seedUser(t, db, "bob")

	users, err := repo.Filter(dto.UserFilter{Login: "ali"})
	if err != nil {
		t.Fatalf("Filter: %v", err)
	}
	if len(users) != 1 || users[0].Login != "alice" {
		t.Fatalf("expected only alice, got %+v", users)
	}
}

func TestUserRepositorySearchUsers(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "alice")
	seedUser(t, db, "bob")

	users, err := repo.SearchUsers(999, dto.UserFilter{Q: "ali", Limit: 10, Page: 1})
	if err != nil {
		t.Fatalf("SearchUsers: %v", err)
	}
	if len(users) != 1 || users[0].Login != "alice" {
		t.Fatalf("expected alice, got %+v", users)
	}
}

func TestUserRepositorySearchUsersFriendsRelation(t *testing.T) {
	db := newTestDB(t)
	userRepo := NewUserRepository(db)
	friendRepo := NewFriendRepository(db)

	me := seedUser(t, db, "me")
	friend := seedUser(t, db, "friend")
	seedUser(t, db, "stranger")

	req, err := friendRepo.SendFriendRequest(me.ID, friend.ID)
	if err != nil {
		t.Fatalf("send request: %v", err)
	}
	if err := friendRepo.BuildFriendship(*req); err != nil {
		t.Fatalf("build friendship: %v", err)
	}

	users, err := userRepo.SearchUsers(me.ID, dto.UserFilter{
		Relations: []string{"friends"},
		Limit:     10,
		Page:      1,
	})
	if err != nil {
		t.Fatalf("SearchUsers: %v", err)
	}
	if len(users) != 1 || users[0].Login != "friend" {
		t.Fatalf("expected only friend, got %+v", users)
	}
}

func TestUserRepositorySearchUsersSortByLogin(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "zoe")
	seedUser(t, db, "amy")

	users, err := repo.SearchUsers(999, dto.UserFilter{Sort: "username_asc", Limit: 10, Page: 1})
	if err != nil {
		t.Fatalf("SearchUsers: %v", err)
	}
	if len(users) != 2 || users[0].Login != "amy" {
		t.Fatalf("expected amy first, got %+v", users)
	}
}

func TestUserRepositoryUpdateEmail(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	user := seedUser(t, db, "dave")

	rows, err := repo.UpdateUserEmail(user.ID, dto.ModifyInputEmail{Email: "new@test.com"})
	if err != nil {
		t.Fatalf("UpdateUserEmail: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expected 1 row affected, got %d", rows)
	}

	found, _ := repo.FindByLogin("dave")
	if found.Email == nil || *found.Email != "new@test.com" {
		t.Fatalf("expected email updated, got %v", found.Email)
	}
}

func TestUserRepositoryUpdateEmailConflict(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "eve")
	user2 := seedUser(t, db, "frank")

	_, err := repo.UpdateUserEmail(user2.ID, dto.ModifyInputEmail{Email: "eve@test.com"})
	if err == nil {
		t.Fatal("expected conflict when email already in use")
	}
}

func TestUserRepositoryUpdateUserData(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	user := seedUser(t, db, "grace")
	name := "Grace"
	status := "busy"

	rows, err := repo.UpdateUserData(user.ID, dto.ModifyInputData{
		Name:   &name,
		Status: &status,
	})
	if err != nil {
		t.Fatalf("UpdateUserData: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expected 1 row affected, got %d", rows)
	}

	found, _ := repo.FindByLogin("grace")
	if found.Name != "Grace" || found.State != "busy" {
		t.Fatalf("expected updated data, got name=%q state=%q", found.Name, found.State)
	}
}

func TestUserRepositoryGetUserData(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	user := seedUser(t, db, "heidi")

	data, err := repo.GetUserData(user.ID)
	if err != nil {
		t.Fatalf("GetUserData: %v", err)
	}
	if data.Login != "heidi" {
		t.Fatalf("expected heidi, got %q", data.Login)
	}
}

func TestUserRepositoryIsDuplicatedKey(t *testing.T) {
	db := newTestDB(t)
	repo := NewUserRepository(db)

	seedUser(t, db, "ivan")
	dup := seedUser(t, db, "julia")
	dup.Login = "ivan"

	err := db.Create(&dup).Error
	if err == nil {
		t.Fatal("expected duplicate error")
	}
	if !repo.IsDuplicatedKey(err) {
		t.Fatalf("expected duplicated key, got %v", err)
	}
}
