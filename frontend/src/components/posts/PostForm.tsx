import { useState } from "react";
import type { FormEvent } from "react";

import { createPost } from "api/Posts";
import type { Post } from "api/Posts";

import { ImageUploadField } from "@components/ImageUploadField";

import {
	ALLOWED_POST_FILE_TYPES,
	validatePostDraft,
	validatePostFile,
} from "@utils/postValidation";

import { getPostCreateErrorMessage } from "@utils/apiErrorMessages";

type PostFormProps = {
	onCreated: (post: Post) => void;
};

export const PostForm = ({ onCreated }: PostFormProps) => {
	const [content, setContent] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const validationError = validatePostDraft(content, file);

		if (validationError) {
			setError(validationError);
			return;
		}

		const trimmedContent = content.trim();
		const formData = new FormData();

		if (trimmedContent !== "") {
			formData.append("content", trimmedContent);
		}

		if (file) {
			// Se mantiene el nombre multipart actual para no cambiar la API.
			formData.append("image", file);
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
				<label htmlFor="post-content">
					Post content
				</label>

				<textarea
					id="post-content"
					className="post-form__textarea"
					value={content}
					onChange={(event) =>
						setContent(event.target.value)
					}
					placeholder="Write something."
					rows={6}
				/>
			</div>

			<ImageUploadField
				id="post-file"
				label="Image or PDF"
				file={file}
				accept={ALLOWED_POST_FILE_TYPES.join(",")}
				disabled={isSubmitting}
				previewAlt="Post preview"
				validate={validatePostFile}
				onChange={setFile}
				onError={setError}
			/>

			{error && (
				<p className="post-form__error">
					{error}
				</p>
			)}

			<div className="post-form__actions">
				<button
					className="post-form__submit"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Publishing." : "Publish"}
				</button>
			</div>
		</form>
	);
};
