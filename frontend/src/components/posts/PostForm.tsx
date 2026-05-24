import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { createPost } from "../../api/Posts";
import type { Post } from "../../api/Posts";

type PostFormProps = {
	onCreated: (post: Post) => void;
};

const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
];

function getErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	return "No se pudo crear el post.";
}

export const PostForm = ({ onCreated }: PostFormProps) => {
	const [content, setContent] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!image) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(image);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [image]);

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] ?? null;

		setError(null);

		if (!selectedFile) {
			setImage(null);
			return;
		}

		if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
			setImage(null);
			event.target.value = "";
			setError("La imagen debe ser JPG, PNG o WEBP.");
			return;
		}

		if (selectedFile.size > MAX_POST_IMAGE_SIZE) {
			setImage(null);
			event.target.value = "";
			setError("La imagen no puede superar los 5 MB.");
			return;
		}

		setImage(selectedFile);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedContent = content.trim();

		if (trimmedContent === "" && image === null) {
			setError("El post debe tener texto o imagen.");
			return;
		}

		const formData = new FormData();

		if (trimmedContent !== "") {
			formData.append("content", trimmedContent);
		}

		if (image !== null) {
			formData.append("image", image);
		}

		try {
			setIsSubmitting(true);
			setError(null);

			const createdPost = await createPost(formData);
			onCreated(createdPost);
		} catch (submitError) {
			setError(getErrorMessage(submitError));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="post-form" onSubmit={handleSubmit}>
			<div className="post-form__field">
				<label htmlFor="post-content">Texto</label>
				<textarea
					id="post-content"
					className="post-form__textarea"
					value={content}
					onChange={(event) => setContent(event.target.value)}
					placeholder="Escribe algo..."
					rows={6}
				/>
			</div>

			<div className="post-form__field">
				<label htmlFor="post-image">Imagen</label>
				<input
					id="post-image"
					className="post-form__file"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleImageChange}
				/>
			</div>

			{previewUrl && (
				<div className="post-form__preview">
					<img src={previewUrl} alt="Vista previa del post" />
				</div>
			)}

			{error && <p className="post-form__error">{error}</p>}

			<div className="post-form__actions">
				<button
					className="post-form__submit"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Publicando..." : "Publicar"}
				</button>
			</div>
		</form>
	);
};
