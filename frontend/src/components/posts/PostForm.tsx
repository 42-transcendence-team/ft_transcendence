import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { createPost } from "api/Posts";
import type { Post } from "api/Posts";
import {
	validatePostDraft,
	validatePostImage,
} from "@utils/postValidation";
import { getPostCreateErrorMessage } from "@utils/apiErrorMessages";

type PostFormProps = {
	onCreated: (post: Post) => void;
};

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

		const imageError = validatePostImage(selectedFile);

		if (imageError) {
			setImage(null);
			event.target.value = "";
			setError(imageError);
			return;
		}

		setImage(selectedFile);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const validationError = validatePostDraft(content, image);

		if (validationError) {
			setError(validationError);
			return;
		}

		const trimmedContent = content.trim();
		const formData = new FormData();

		if (trimmedContent !== "") {
			formData.append("content", trimmedContent);
		}

		if (image) {
			formData.append("image", image);
		}

		try {
			setIsSubmitting(true);
			setError(null);

			const createdPost = await createPost(formData);

			onCreated(createdPost);
		} catch (submitError) {
			setError(getPostCreateErrorMessage(submitError));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="post-form" onSubmit={handleSubmit}>
			<div className="post-form__field">
				<label htmlFor="post-content">Post content</label>
				<textarea
					id="post-content"
					className="post-form__textarea"
					value={content}
					onChange={(event) => setContent(event.target.value)}
					placeholder="Write something."
					rows={6}
				/>
			</div>

			<div className="post-form__field">
				<label htmlFor="post-image">Image</label>
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
					<img src={previewUrl} alt="Post preview" />
				</div>
			)}

			{error && <p className="post-form__error">{error}</p>}

			<div className="post-form__actions">
				<button
					className="post-form__submit"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Publishing..." : "Publish"}
				</button>
			</div>
		</form>
	);
};