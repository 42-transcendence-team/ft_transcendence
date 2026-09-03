// Service = capa de lógica de negocio.
// Aquí se validan las reglas propias de los posts, como que el contenido
// no esté vacío o que no supere la longitud máxima.
// El handler recibe la petición HTTP y el repository habla con la DB;
// este archivo queda en medio para decidir si la operación tiene sentido.

package services

import (
	"backend/internal/dto"
	appErr "backend/internal/errors"
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"strings"

	"gorm.io/gorm"
)

const maxPostContentLength = 5000

// requirePostAccess comprueba que el usuario pueda acceder a una publicación:
// debe ser suya o estar etiquetado como amigo del autor.
func requirePostAccess(
	friendRepo *repository.FriendRepository,
	post *models.Post,
	currentUserID uint,
) error {
	if post.UserID == currentUserID {
		return nil
	}

	areFriends, err := friendRepo.AreFriends(
		post.UserID,
		currentUserID,
	)
	if err != nil {
		return appErr.NewInternal(err)
	}

	if !areFriends {
		return appErr.NewForbidden("not_friends")
	}

	return nil
}

type PostService struct {
	postRepo     *repository.PostRepository
	postLikeRepo *repository.PostLikeRepository
	friendRepo   *repository.FriendRepository
}

func NewPostService(
	postRepo *repository.PostRepository,
	postLikeRepo *repository.PostLikeRepository,
	friendRepo *repository.FriendRepository,
) *PostService {
	return &PostService{
		postRepo:     postRepo,
		postLikeRepo: postLikeRepo,
		friendRepo:   friendRepo,
	}
}

func (s *PostService) CreatePost(
	input dto.CreatePostInput,
) (*dto.PostResponse, error) {
	content := strings.TrimSpace(input.Content)

	var contentPtr *string
	if content != "" {
		contentPtr = &content
	}

	var imagePathPtr *string
	if input.ImagePath != nil {
		imagePath := strings.TrimSpace(
			*input.ImagePath,
		)

		if imagePath != "" {
			imagePathPtr = &imagePath
		}
	}

	var fileNamePtr *string
	if imagePathPtr != nil && input.FileName != nil {
		fileName := strings.TrimSpace(
			*input.FileName,
		)

		if fileName != "" {
			fileNamePtr = &fileName
		}
	}

	if contentPtr == nil && imagePathPtr == nil {
		return nil, appErr.NewValidation(
			map[string]string{
				"post": "content_or_image_required",
			},
		)
	}

	if contentPtr != nil &&
		len([]rune(*contentPtr)) > maxPostContentLength {
		return nil, appErr.NewValidation(
			map[string]string{
				"content": "max",
			},
		)
	}

	post := models.Post{
		UserID:    input.UserID,
		Content:   contentPtr,
		ImagePath: imagePathPtr,
		FileName:  fileNamePtr,
	}

	createdPost, err := s.postRepo.Create(&post)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	response := dto.NewPostResponse(
		*createdPost,
		0,
		0,
		false,
		false,
	)

	return &response, nil
}

func (s *PostService) GetPostByID(
	postID uint,
	currentUserID uint,
) (*dto.PostResponse, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound(
				"post_not_found",
			)
		}

		return nil, appErr.NewInternal(err)
	}

	if err := requirePostAccess(
		s.friendRepo,
		post,
		currentUserID,
	); err != nil {
		return nil, err
	}

	likeCount, err :=
		s.postLikeRepo.CountByPostIDAndReaction(
			postID,
			models.PostReactionLike,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	dislikeCount, err :=
		s.postLikeRepo.CountByPostIDAndReaction(
			postID,
			models.PostReactionDislike,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	currentReaction, exists, err :=
		s.postLikeRepo.GetReactionByPostAndUser(
			postID,
			currentUserID,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	likedByCurrentUser :=
		exists &&
			currentReaction == models.PostReactionLike

	dislikedByCurrentUser :=
		exists &&
			currentReaction == models.PostReactionDislike

	response := dto.NewPostResponse(
		*post,
		likeCount,
		dislikeCount,
		likedByCurrentUser,
		dislikedByCurrentUser,
	)

	return &response, nil
}

// ListFeed devuelve las publicaciones del usuario autenticado
// y de sus amistades al usar ListFeedForUser.
// AuthorizePostImage localiza el post dueño de una ruta de imagen y
// comprueba que el usuario actual pueda acceder a él (autor o amigo).
func (s *PostService) AuthorizePostImage(
	imagePath string,
	currentUserID uint,
) error {
	post, err := s.postRepo.FindByImagePath(imagePath)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return appErr.NewNotFound(
				"post_not_found",
			)
		}

		return appErr.NewInternal(err)
	}

	return requirePostAccess(
		s.friendRepo,
		post,
		currentUserID,
	)
}

func (s *PostService) ListFeed(
	currentUserID uint,
	page int,
	limit int,
) (*dto.PostListResponse, error) {
	posts, total, err :=
		s.postRepo.ListFeedForUser(
			currentUserID,
			page,
			limit,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildPostListResponse(
		posts,
		total,
		page,
		limit,
	)
}

// ListPostsByUserID devuelve los posts del propietario del perfil.
// Solo puede verlos el propio usuario o un amigo suyo.
func (s *PostService) ListPostsByUserID(
	userID uint,
	currentUserID uint,
	page int,
	limit int,
) (*dto.PostListResponse, error) {
	if userID != currentUserID {
		areFriends, err :=
			s.friendRepo.AreFriends(
				userID,
				currentUserID,
			)
		if err != nil {
			return nil, appErr.NewInternal(err)
		}

		if !areFriends {
			return nil, appErr.NewForbidden(
				"not_friends",
			)
		}
	}

	posts, total, err :=
		s.postRepo.ListByUserID(
			userID,
			page,
			limit,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	return s.buildPostListResponse(
		posts,
		total,
		page,
		limit,
	)
}

// buildPostListResponse construye los DTO de tarjeta y obtiene
// todos sus contadores mediante una única consulta agrupada.
func (s *PostService) buildPostListResponse(
	posts []models.Post,
	total int64,
	page int,
	limit int,
) (*dto.PostListResponse, error) {
	postIDs := make([]uint, 0, len(posts))

	for _, post := range posts {
		postIDs = append(postIDs, post.ID)
	}

	countsByPostID, err :=
		s.postLikeRepo.CountGroupedByPostIDs(
			postIDs,
		)

	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	summaries := make(
		[]dto.PostSummaryResponse,
		0,
		len(posts),
	)

	for _, post := range posts {
		reactionCounts := countsByPostID[post.ID]

		summaries = append(
			summaries,
			dto.NewPostSummaryResponse(
				post,
				reactionCounts.LikeCount,
				reactionCounts.DislikeCount,
			),
		)
	}

	return &dto.PostListResponse{
		Data: summaries,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
			TotalPages: calculateTotalPages(
				total,
				limit,
			),
		},
	}, nil
}

func calculateTotalPages(
	total int64,
	limit int,
) int {
	if total == 0 || limit <= 0 {
		return 0
	}

	return int(
		(total + int64(limit) - 1) /
			int64(limit),
	)
}

func (s *PostService) DeletePost(
	userID uint,
	postID uint,
) (*string, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, appErr.NewNotFound(
				"post_not_found",
			)
		}

		return nil, appErr.NewInternal(err)
	}

	if post.UserID != userID {
		return nil, appErr.NewForbidden(
			"cannot_delete_other_user_post",
		)
	}

	imagePath := post.ImagePath

	rows, err := s.postRepo.Delete(post)
	if err != nil {
		return nil, appErr.NewInternal(err)
	}

	if rows == 0 {
		return nil, appErr.NewNotFound(
			"post_not_found",
		)
	}

	return imagePath, nil
}
