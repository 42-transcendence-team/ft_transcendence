package dto

type PostLikeStateResponse struct {
	PostID                uint  `json:"postId"`
	LikeCount             int64 `json:"likeCount"`
	DislikeCount          int64 `json:"dislikeCount"`
	LikedByCurrentUser    bool  `json:"likedByCurrentUser"`
	DislikedByCurrentUser bool  `json:"dislikedByCurrentUser"`
}
