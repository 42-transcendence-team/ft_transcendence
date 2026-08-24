import type { PostSummary } from "api/Posts";
import { isPdfPostFile } from "@utils/postVariant";

export type PostCardVariant =
	| "text"
	| "image"
	| "pdf"
	| "text-image"
	| "text-pdf";

export function getPostCardVariant(
	post: PostSummary,
): PostCardVariant {
	const hasText = Boolean(
		post.content?.trim(),
	);

	const hasFile = Boolean(
		post.imagePath,
	);

	const hasPdf =
		hasFile &&
		isPdfPostFile(post.imagePath);

	if (hasText && hasPdf) {
		return "text-pdf";
	}

	if (hasText && hasFile) {
		return "text-image";
	}

	if (hasPdf) {
		return "pdf";
	}

	if (hasFile) {
		return "image";
	}

	return "text";
}
