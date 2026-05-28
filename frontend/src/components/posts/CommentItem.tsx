import type { Comment } from "../../api/Comments";

type CommentItemProps = {
	comment: Comment;
	isOwner: boolean;
	isDeleting: boolean;
	onDelete: (commentId: number) => void;
};

function formatCommentDate(value: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export const CommentItem = ({
	comment,
	isOwner,
	isDeleting,
	onDelete,
}: CommentItemProps) => {
	return (
		<article className="comment-item">
			<header className="comment-item__header">
				<div>
					<p className="comment-item__author">@{comment.author.login}</p>
					<time
						className="comment-item__date"
						dateTime={comment.createdAt}
					>
						{formatCommentDate(comment.createdAt)}
					</time>
				</div>

				{isOwner && (
					<button
						className="comment-item__delete-button"
						type="button"
						onClick={() => onDelete(comment.id)}
						disabled={isDeleting}
					>
						{isDeleting ? "Eliminando..." : "Eliminar"}
					</button>
				)}
			</header>

			<p className="comment-item__content">{comment.content}</p>
		</article>
	);
};
