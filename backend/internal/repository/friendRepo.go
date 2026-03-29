package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type FriendRepository struct {
	db *gorm.DB
}

func NewFriendRepository(db *gorm.DB) *FriendRepository {
	return &FriendRepository{
		db: db,
	}
}

// importante siempre guradar las relacciones asi:
// userID1 = menor ID
// userID2 = mayor ID

func (r *FriendRepository) CreateFriendship(userID1 uint, userID2 uint) error {

	u1, u2 := normalizePair(userID1, userID2)

	frisndship := models.Friendship{
		User1ID: u1,
		User2ID: u2,
	}

	return r.db.Create(&frisndship).Error
}

func (r *FriendRepository) SendFriendRequest(senderID uint, reciverID uint) error {

	friendRequest := models.FriendRequest{
		SenderID:  senderID,
		ReciverID: reciverID,
		Status:    "pending",
	}

	return r.db.Create(&friendRequest).Error
}

func (r *FriendRepository) AreFriends(userID1 uint, userID2 uint) (bool, error) {

	u1, u2 := normalizePair(userID1, userID2)

	// busca cuantas filas cumplen esa pareja
	var count int64
	err := r.db.Model(&models.Friendship{}).
		Where("user_id = ? AND user_id = ?", u1, u2).Count(&count).Error
	if err != nil {
		return false, err
	}
	// si count > 0 son amigos
	return count > 0, nil
}

func (r *FriendRepository) IsRequest(senderID uint, reciverID uint) (bool, error) {

	var count int64

	err := r.db.Model(&models.FriendRequest{}).Where(
		"(sender_id = ? AND reciver_id = ?) OR (sender_id = ? AND reciver_id = ?)",
		senderID, reciverID,
		reciverID, senderID,
	).Count(&count).Error

	if err != nil {
		return false, err
	}

	// si count > 0 hay peticion ya creada por parte de alguna de las partes
	return count > 0, nil
}

// mira si hay bloqueo por alguna de las partes
func (r *FriendRepository) AreBlock(userID1 uint, userID2 uint) (bool, error) {

	var count int64

	err := r.db.Model(&models.Block{}).Where(
		"(bloker_id = ? AND bloked_id = ?) OR (bloker_id = ? AND bloked_id = ?)",
		userID1, userID2,
		userID2, userID1,
	).Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, err
}

// siempre se van a guardar las relacciones en la base de datos el usuario 1 sera el indice menor
// el usuairio 2 sera el indice mayor
func normalizePair(a, b uint) (uint, uint) {
	if a < b {
		return a, b
	}
	return b, a
}
