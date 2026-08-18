package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"strings"
)

type AdvancedSearchService struct {
	UserRepo   *repository.UserRepository
	FriendRepo *repository.FriendRepository
}

func NewAdvancedSearch(userRepo *repository.UserRepository, friendRepo *repository.FriendRepository) *AdvancedSearchService {
	return &AdvancedSearchService{
		UserRepo:   userRepo,
		FriendRepo: friendRepo,
	}
}

// TODO: Borrar funcion
func (s *UserService) Filter(filter dto.UserFilter) ([]models.User, error) {
	// Faltan todas las validaciones de filtrado, como accesos permitidos y denegados o tamaños maximos de input...
	// Tambien, dependiendo de lo anterior, que datos/objeto se devuelve (Admin: todos, User: login, email, surname, ...)
	// De momento funciona en cualquier caso y devuelve todo segun ausencia o no de filtros
	return s.UserRepo.Filter(filter)
}

func (s *AdvancedSearchService) SearchUsers(userID uint, filter *dto.UserFilter) (*dto.UserSearchResponse, error) {

	err := validateUserSearchFilter(filter)
	if err != nil {
		return nil, err
	}

	users, err := s.UserRepo.SearchUsers(userID, *filter)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}
	totalUsers, err := s.UserRepo.CountSearchUsers(userID, *filter)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	// TODO: falta meter filtro de que solo me aparezcan los usuarios amigos mios, o las request
	items := []dto.UserSearch{}

	for _, user := range users {
		relation, requestID, err := s.getUserRelation(userID, user.ID)
		if err != nil {
			return nil, err
		}

		avatarURL := ""
		if user.AvatarPath != nil {
			avatarURL = *user.AvatarPath
		}
		item := dto.UserSearch{
			ID:         user.ID,
			Login:      user.Login,
			Name:       user.Name,
			Surname:    user.Surname,
			AvatarURL:  avatarURL,
			Relation:   relation,
			CanSendReq: relation == "none",
			RequestID:  requestID,
		}
		items = append(items, item)
	}

	response := dto.UserSearchResponse{
		Items:   items,
		Page:    filter.Page,
		Limit:   filter.Limit,
		Total:   totalUsers,
		HasNext: filter.Page*filter.Limit < int(totalUsers),
	}

	return &response, nil
}

func validateUserSearchFilter(filter *dto.UserFilter) error {

	filter.Q = strings.TrimSpace(filter.Q)

	if filter.Sort == "" {
		filter.Sort = "username_asc"
	}

	allowedSorts := map[string]bool{
		"username_asc":  true,
		"username_desc": true,
		"newest":        true,
		"oldest":        true,
	}

	if !allowedSorts[filter.Sort] {
		return appErr.NewValidation(map[string]string{
			"sort": "invalid sort value",
		})
	}

	return nil
}

func (s *AdvancedSearchService) getUserRelation(currentUserID uint, otherUserID uint) (string, *uint, error) {

	block, err := s.FriendRepo.GetBlock(currentUserID, otherUserID)
	if err != nil {
		return "", nil, appErr.NewInternal(err)
	}
	if block != nil {
		if block.BlockedID == currentUserID { // Me ha bloqueado el usuario ?
			return "blocked_me", nil, nil
		}
		if block.BlockerID == currentUserID { // he bloqueado al usuario ?
			return "blocked_by_me", nil, nil
		}
	}

	// hay amistad ?
	areFriends, err := s.FriendRepo.AreFriends(currentUserID, otherUserID)
	if err != nil {
		return "", nil, appErr.NewInternal(err)
	} else if areFriends == true {
		return "friends", nil, nil
	}
	// hay peticion de amistad por alguna de las dos partes ?
	friendReq, err := s.FriendRepo.GetPendingRequestBetweenUsers(currentUserID, otherUserID)
	if err != nil {
		return "", nil, appErr.NewInternal(err)
	} else if friendReq == nil {
		return "none", nil, nil
	} else if friendReq.SenderID == currentUserID {
		return "pending_sent", &friendReq.ID, nil
	} else if friendReq.ReceiverID == currentUserID {
		return "pending_received", &friendReq.ID, nil
	}

	return "none", nil, nil
}

func (s *AdvancedSearchService) GetUserRelation(
	currentUserID uint,
	otherUserID uint,
) (string, *uint, error) {
	return s.getUserRelation(currentUserID, otherUserID)
}
