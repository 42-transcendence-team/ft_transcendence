import type { Post } from "api/Posts";

export type PostVariant = "text" | "image" | "mixed";

export function getPostVariant(post: Post): PostVariant {
	const hasText = Boolean(post.content?.trim());
	const hasImage = Boolean(post.imagePath);

	if (hasText && hasImage) {
		return "mixed";
	}

	if (hasImage) {
		return "image";
	}

	return "text";
}
