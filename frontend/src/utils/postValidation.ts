export const MAX_POST_CONTENT_LENGTH = 5000;
export const MAX_COMMENT_CONTENT_LENGTH = 1000;
export const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_POST_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
];

export function validatePostImage(image: File): string | null {
	if (!ALLOWED_POST_IMAGE_TYPES.includes(image.type)) {
		return "The image must be a PNG, JPG, JPEG or WebP file.";
	}

	if (image.size > MAX_POST_IMAGE_SIZE) {
		return "The image cannot be larger than 5 MB.";
	}

	return null;
}

export function validatePostDraft(
	content: string,
	image: File | null,
): string | null {
	const trimmedContent = content.trim();

	if (trimmedContent === "" && image === null) {
		return "You cannot publish an empty post.";
	}

	if (trimmedContent.length > MAX_POST_CONTENT_LENGTH) {
		return `The post cannot exceed ${MAX_POST_CONTENT_LENGTH} characters.`;
	}

	if (image !== null) {
		return validatePostImage(image);
	}

	return null;
}

export function validateCommentContent(content: string): string | null {
	const trimmedContent = content.trim();

	if (trimmedContent === "") {
		return "The comment cannot be empty.";
	}

	if (trimmedContent.length > MAX_COMMENT_CONTENT_LENGTH) {
		return `The comment cannot exceed ${MAX_COMMENT_CONTENT_LENGTH} characters.`;
	}

	return null;
}
