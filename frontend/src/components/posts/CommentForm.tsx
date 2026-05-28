import { useState } from "react";
import type { FormEvent } from "react";

import { createComment } from "../../api/Comments";
import type { Comment } from "../../api/Comments";

type CommentFormProps = {
	postId: string | number;
	onCreated: (comment: Comment) => void;
};

function getErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	return "No se pudo publicar el comentario.";
}

export const CommentForm = ({ postId, onCreated }: CommentFormProps) => {
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedContent = content.trim();

		if (trimmedContent === "") {
			setError("El comentario no puede estar vacío.");
			return;
		}

		try {
			setIsSubmitting(true);
			setError(null);

			const createdComment = await createComment(postId, trimmedContent);

			onCreated(createdComment);
			setContent("");
		} catch (submitError) {
			setError(getErrorMessage(submitError));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="comment-form" onSubmit={handleSubmit}>
			<label className="comment-form__label" htmlFor="comment-content">
				Escribe un comentario
			</label>

			<textarea
				id="comment-content"
				className="comment-form__textarea"
				value={content}
				onChange={(event) => setContent(event.target.value)}
				placeholder="Añade un comentario..."
				rows={4}
			/>

			{error && <p className="comment-form__error">{error}</p>}

			<div className="comment-form__actions">
				<button
					className="comment-form__submit"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Publicando..." : "Comentar"}
				</button>
			</div>
		</form>
	);
};
