import { useState } from "react";

import { likePost, unlikePost } from "api/Posts";
import type { PostLikeState } from "api/Posts";

type LikeButtonProps = {
	postId: number;
	likeCount: number;
	likedByCurrentUser: boolean;
	onChange: (likeState: PostLikeState) => void;
};

function getLikeErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof error.status === "number"
	) {
		if (error.status === 401) {
			return "You must be logged in to like posts.";
		}

		if (error.status === 404) {
			return "This post no longer exists.";
		}
	}

	return "Could not update like.";
}

export const LikeButton = ({
	postId,
	likeCount,
	likedByCurrentUser,
	onChange,
}: LikeButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleClick = async () => {
		if (isLoading) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const nextState = likedByCurrentUser
				? await unlikePost(postId)
				: await likePost(postId);

			onChange(nextState);
		} catch (likeError) {
			setError(getLikeErrorMessage(likeError));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="like-button">
			<button
				className={`like-button__control${
					likedByCurrentUser ? " like-button__control--active" : ""
				}`}
				type="button"
				onClick={handleClick}
				disabled={isLoading}
				aria-pressed={likedByCurrentUser}
				aria-label={likedByCurrentUser ? "Unlike post" : "Like post"}
			>
				<span className="like-button__icon" aria-hidden="true">
					{likedByCurrentUser ? "♥" : "♡"}
				</span>
				<span className="like-button__count">{likeCount}</span>
			</button>

			{error && <p className="like-button__error">{error}</p>}
		</div>
	);
};
