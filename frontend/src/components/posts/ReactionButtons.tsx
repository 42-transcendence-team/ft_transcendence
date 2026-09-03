import { useState } from "react";
import {
	FaRegThumbsDown,
	FaRegThumbsUp,
	FaThumbsDown,
	FaThumbsUp,
} from "react-icons/fa";

import {
	dislikePost,
	likePost,
	undislikePost,
	unlikePost,
} from "api/Posts";
import type { PostReactionState } from "api/Posts";

type ReactionButtonsProps = {
	postId: number;
	likeCount: number;
	dislikeCount: number;
	likedByCurrentUser: boolean;
	dislikedByCurrentUser: boolean;
	onChange: (reactionState: PostReactionState) => void;
};

type ReactionAction = "like" | "dislike";

function getReactionErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof error.status === "number"
	) {
		if (error.status === 401) {
			return "Debes iniciar sesión para reaccionar a las publicaciones.";
		}

		if (error.status === 404) {
			return "Esta publicación ya no existe.";
		}
	}

	return "No se ha podido actualizar la reacción.";
}

export const ReactionButtons = ({
	postId,
	likeCount,
	dislikeCount,
	likedByCurrentUser,
	dislikedByCurrentUser,
	onChange,
}: ReactionButtonsProps) => {
	const [loadingAction, setLoadingAction] =
		useState<ReactionAction | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleReaction = async (action: ReactionAction) => {
		if (loadingAction !== null) {
			return;
		}

		try {
			setLoadingAction(action);
			setError(null);

			let nextState: PostReactionState;

			if (action === "like") {
				nextState = likedByCurrentUser
					? await unlikePost(postId)
					: await likePost(postId);
			} else {
				nextState = dislikedByCurrentUser
					? await undislikePost(postId)
					: await dislikePost(postId);
			}

			onChange(nextState);
		} catch (reactionError) {
			setError(getReactionErrorMessage(reactionError));
		} finally {
			setLoadingAction(null);
		}
	};

	const isLoading = loadingAction !== null;

	return (
		<div className="reaction-buttons">
			<div
				className="reaction-buttons__controls"
				aria-label="Reacciones a la publicación"
			>
				<button
					className={`reaction-buttons__control reaction-buttons__control--like${
						likedByCurrentUser
							? " reaction-buttons__control--active"
							: ""
					}`}
					type="button"
					onClick={() => handleReaction("like")}
					disabled={isLoading}
					aria-pressed={likedByCurrentUser}
					aria-label={likedByCurrentUser ? "Retirar Me gusta" : "Indicar que te gusta la publicación"}
				>
					<span
						className="reaction-buttons__icon"
						aria-hidden="true"
					>
						{likedByCurrentUser ? (
							<FaThumbsUp />
						) : (
							<FaRegThumbsUp />
						)}
					</span>

					<span className="reaction-buttons__count">
						{likeCount}
					</span>
				</button>

				<button
					className={`reaction-buttons__control reaction-buttons__control--dislike${
						dislikedByCurrentUser
							? " reaction-buttons__control--active"
							: ""
					}`}
					type="button"
					onClick={() => handleReaction("dislike")}
					disabled={isLoading}
					aria-pressed={dislikedByCurrentUser}
					aria-label={
						dislikedByCurrentUser
							? "Retirar No me gusta"
							: "Indicar que no te gusta la publicación"
					}
				>
					<span
						className="reaction-buttons__icon"
						aria-hidden="true"
					>
						{dislikedByCurrentUser ? (
							<FaThumbsDown />
						) : (
							<FaRegThumbsDown />
						)}
					</span>

					<span className="reaction-buttons__count">
						{dislikeCount}
					</span>
				</button>
			</div>

			{error && (
				<p className="reaction-buttons__error">
					{error}
				</p>
			)}
		</div>
	);
};
