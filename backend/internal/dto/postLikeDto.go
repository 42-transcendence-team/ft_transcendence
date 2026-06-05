package dto

type PostLikeStateResponse struct {
	PostID             uint  `json:"postId"`
	LikeCount          int64 `json:"likeCount"`
	LikedByCurrentUser bool  `json:"likedByCurrentUser"`
}
