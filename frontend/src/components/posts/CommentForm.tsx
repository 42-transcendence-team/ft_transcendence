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

	const canSubmit = content.trim() !== "" && !isSubmitting;

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
		<form className="comment-form comment-form--compact" onSubmit={handleSubmit}>
			<div className="comment-form__composer">
				<textarea
					className="comment-form__textarea"
					value={content}
					onChange={(event) => setContent(event.target.value)}
					placeholder="Añade un comentario."
					aria-label="Añadir un comentario"
					rows={1}
				/>

				<button
					className="comment-form__submit"
					type="submit"
					disabled={!canSubmit}
					aria-label="Publicar comentario"
				>
					{isSubmitting ? "Enviando..." : "Enviar"}
				</button>
			</div>

			{error && <p className="comment-form__error">{error}</p>}
		</form>
	);
};
