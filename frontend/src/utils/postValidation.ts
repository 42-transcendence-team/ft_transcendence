export const MAX_POST_CONTENT_LENGTH = 5000;
export const MAX_COMMENT_CONTENT_LENGTH = 1000;
export const MAX_POST_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_POST_FILE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
];

export function validatePostFile(file: File): string | null {
	if (!ALLOWED_POST_FILE_TYPES.includes(file.type)) {
		return "The file must be a PNG, JPG, JPEG, WebP or PDF file.";
	}

	if (file.size > MAX_POST_FILE_SIZE) {
		return "The file cannot be larger than 5 MB.";
	}

	return null;
}

export function validatePostDraft(
	content: string,
	file: File | null,
): string | null {
	const trimmedContent = content.trim();

	if (trimmedContent === "" && file === null) {
		return "You cannot publish an empty post.";
	}

	if (trimmedContent.length > MAX_POST_CONTENT_LENGTH) {
		return `The post cannot exceed ${MAX_POST_CONTENT_LENGTH} characters.`;
	}

	if (file !== null) {
		return validatePostFile(file);
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
