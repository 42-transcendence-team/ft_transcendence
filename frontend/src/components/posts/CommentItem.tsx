import { FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";

import skullLogo from "@icons/skull_logo.png";

import type { Comment } from "api/Comments";

type CommentItemProps = {
	comment: Comment;
	isOwner: boolean;
	isDeleting: boolean;
	onRequestDelete: (commentId: number) => void;
};

function formatCommentDate(value: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function getPublicPath(path: string): string {
	if (path.startsWith("/")) {
		return path;
	}

	return `/${path}`;
}

function getAvatarSrc(avatarPath?: string | null): string {
	if (!avatarPath) {
		return skullLogo;
	}

	return getPublicPath(avatarPath);
}

export const CommentItem = ({
	comment,
	isOwner,
	isDeleting,
	onRequestDelete,
}: CommentItemProps) => {
	const avatarSrc = getAvatarSrc(comment.author.avatarPath);

	return (
		<article className="comment-item">
			<header className="comment-item__header">
				<div className="comment-item__author-block">
					<img
						className="comment-item__avatar"
						src={avatarSrc}
						alt=""
					/>

					<div className="comment-item__meta">
						<Link
							className="comment-item__author"
							to={`/app/profile/${comment.author.login}`}
						>
							{comment.author.login}
						</Link>

						<time
							className="comment-item__date"
							dateTime={comment.createdAt}
						>
							{formatCommentDate(comment.createdAt)}
						</time>
					</div>
				</div>

				{isOwner && (
					<button
						className="comment-item__delete-button"
						type="button"
						onClick={() => onRequestDelete(comment.id)}
						disabled={isDeleting}
						aria-label={
							isDeleting
								? "Deleting comment"
								: "Delete comment"
						}
						title={
							isDeleting
								? "Deleting comment"
								: "Delete comment"
						}
					>
						<FiTrash2 size={16} aria-hidden="true" />
					</button>
				)}
			</header>

			<p className="comment-item__content">{comment.content}</p>
		</article>
	);
};
