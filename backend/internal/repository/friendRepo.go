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

func (r *FriendRepository) CreateFriendship(tx *gorm.DB, userID1 uint, userID2 uint) error {

	u1, u2 := normalizePair(userID1, userID2)

	friendship := models.Friendship{
		User1ID: u1,
		User2ID: u2,
	}

	return tx.Create(&friendship).Error
}

func (r *FriendRepository) ChangeReqPendingStatus(tx *gorm.DB, newStatus models.RelationStatus, reqID uint) error {

	result := tx.Model(&models.FriendRequest{}).
		Where("id = ? AND status = ?", reqID, models.RelationPending).
		Update("status", newStatus)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func (r *FriendRepository) RejectFriendRequest(reqID uint) error {
	err := r.ChangeReqPendingStatus(r.db, models.RelationRejected, reqID)
	if err != nil {
		return err
	}
	return nil
}

func (r *FriendRepository) BuildFriendship(req models.FriendRequest) error {

	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := r.CreateFriendship(tx, req.SenderID, req.ReceiverID); err != nil {
			return err
		}

		if err := r.ChangeReqPendingStatus(tx, models.RelationAccepted, req.ID); err != nil {
			return err
		}

		return nil
	})
}

func (r *FriendRepository) SendFriendRequest(senderID uint, receiverID uint) (*models.FriendRequest, error) {

	friendRequest := models.FriendRequest{
		SenderID:   senderID,
		ReceiverID: receiverID,
		Status:     models.RelationPending,
	}

	return &friendRequest, r.db.Create(&friendRequest).Error
}

func (r *FriendRepository) AreFriends(userID1 uint, userID2 uint) (bool, error) {

	u1, u2 := normalizePair(userID1, userID2)

	// busca cuantas filas cumplen esa pareja
	var count int64
	err := r.db.Model(&models.Friendship{}).
		Where("user1_id = ? AND user2_id = ?", u1, u2).Count(&count).Error
	if err != nil {
		return false, err
	}
	// si count > 0 son amigos
	return count > 0, nil
}

func (r *FriendRepository) HasPendingRequestBetweenUsers(senderID uint, receiverID uint) (bool, error) {

	var count int64

	err := r.db.Model(&models.FriendRequest{}).Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
		senderID, receiverID,
		receiverID, senderID,
		models.RelationPending,
	).Count(&count).Error

	if err != nil {
		return false, err
	}

	// si count > 0 hay peticion ya creada por parte de alguna de las partes
	return count > 0, nil
}

/*
func (r *FriendRepository) IsRequestForMe(senderID uint, receiverID uint) (bool, error) {

	var count int64

	err := r.db.Model(&models.FriendRequest{}).Where(
		"(sender_id = ? AND receiver_id = ?)",
		senderID, receiverID,
	).Count(&count).Error

	if err != nil {
		return false, err
	}

	// si count > 0 hay peticion ya creada por parte de alguna de las partes
	return count > 0, nil
}*/

func (r *FriendRepository) GetReqStatus(senderID uint, receiverID uint) (models.RelationStatus, error) {

	var req models.FriendRequest

	err := r.db.
		Where("sender_id = ? AND receiver_id = ?", senderID, receiverID).
		First(&req).Error

	if err != nil {
		return "", err
	}

	return req.Status, nil
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

	return count > 0, nil
}

func (r *FriendRepository) ListOutgoingRequests(userID uint) ([]models.FriendRequest, error) {
	var requests []models.FriendRequest

	err := r.db.Where("sender_id = ? AND status = ?", userID, models.RelationPending).
		Order("created_at DESC").
		Find(&requests).Error
	if err != nil {
		return nil, err
	}

	return requests, nil
}

func (r *FriendRepository) ListIncomingRequests(userID uint) ([]models.FriendRequest, error) {
	var requests []models.FriendRequest

	err := r.db.Where("receiver_id = ? AND status = ?", userID, models.RelationPending).
		Order("created_at DESC").
		Find(&requests).Error
	if err != nil {
		return nil, err
	}

	return requests, nil
}

/*
func (r *FriendRepository) GetReqSenderID(reqID uint) (uint, error) {

	var req models.FriendRequest

	err := r.db.Where("id = ?", reqID).
		First(&req).Error
	if err != nil {
		return 0, err
	}

	return req.SenderID, nil
}
*/
// siempre se van a guardar las relacciones en la base de datos el usuario 1 sera el indice menor
// el usuairio 2 sera el indice mayor
func normalizePair(a, b uint) (uint, uint) {
	if a < b {
		return a, b
	}
	return b, a
}

/* --------------------------------------------------------------- */

func (r *FriendRepository) GetReqByID(reqID uint) (*models.FriendRequest, error) {

	var req models.FriendRequest

	err := r.db.Where("id = ?", reqID).
		First(&req).Error
	if err != nil {
		return nil, err
	}

	return &req, nil
}
