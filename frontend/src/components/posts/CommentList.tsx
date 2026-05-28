import type { Comment } from "../../api/Comments";
import { CommentItem } from "./CommentItem";

type CommentListProps = {
	comments: Comment[];
	currentUserId: number | null;
	deletingCommentId: number | null;
	onDelete: (commentId: number) => void;
};

export const CommentList = ({
	comments,
	currentUserId,
	deletingCommentId,
	onDelete,
}: CommentListProps) => {
	if (comments.length === 0) {
		return (
			<p className="comments__empty">
				Todavía no hay comentarios.
			</p>
		);
	}

	return (
		<div className="comments__list">
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					isOwner={currentUserId === comment.userId}
					isDeleting={deletingCommentId === comment.id}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};
