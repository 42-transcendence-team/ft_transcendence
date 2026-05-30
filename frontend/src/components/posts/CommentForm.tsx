import { useState } from "react";
import type { FormEvent } from "react";

import { createComment } from "api/Comments";
import type { Comment } from "api/Comments";
import { validateCommentContent } from "@utils/postValidation";
import { getCommentCreateErrorMessage } from "@utils/apiErrorMessages";

type CommentFormProps = {
	postId: string | number;
	onCreated: (comment: Comment) => void;
};

export const CommentForm = ({ postId, onCreated }: CommentFormProps) => {
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const validationError = validateCommentContent(content);

		if (validationError) {
			setError(validationError);
			return;
		}

		const trimmedContent = content.trim();

		try {
			setIsSubmitting(true);
			setError(null);

			const createdComment = await createComment(postId, trimmedContent);

			onCreated(createdComment);
			setContent("");
		} catch (submitError) {
			setError(getCommentCreateErrorMessage(submitError));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="comment-form" onSubmit={handleSubmit}>
			<label className="comment-form__label" htmlFor="comment-content">
				Write a comment
			</label>

			<textarea
				id="comment-content"
				className="comment-form__textarea"
				value={content}
				onChange={(event) => setContent(event.target.value)}
				placeholder="Add a comment."
				rows={4}
			/>

			{error && <p className="comment-form__error">{error}</p>}

			<div className="comment-form__actions">
				<button
					className="comment-form__submit"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Posting..." : "Comment"}
				</button>
			</div>
		</form>
	);
};
