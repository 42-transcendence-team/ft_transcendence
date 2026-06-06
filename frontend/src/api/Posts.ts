import { API_BASE_URL, buildApiError } from "api/ApiRequest";

export type PostAuthor = {
	id: number;
	login: string;
	avatarPath?: string | null;
};

export type Post = {
	id: number;
	userId: number;
	author: PostAuthor;
	content?: string | null;
	imagePath?: string | null;
	likeCount: number;
	likedByCurrentUser: boolean;
	createdAt: string;
	updatedAt: string;
};

export type PostLikeState = {
	postId: number;
	likeCount: number;
	likedByCurrentUser: boolean;
};

type PostApiResponse = {
	message?: string;
	data: Post;
};

type PostLikeApiResponse = {
	message?: string;
	data: PostLikeState;
};

async function parsePostResponse(res: Response): Promise<Post> {
	const json = (await res.json()) as PostApiResponse;
	return json.data;
}

async function parsePostLikeResponse(res: Response): Promise<PostLikeState> {
	const json = (await res.json()) as PostLikeApiResponse;
	return json.data;
}

async function throwPostApiError(res: Response): Promise<never> {
	const errorData = await res.json().catch(() => null);
	throw buildApiError(res, errorData);
}

export async function createPost(formData: FormData): Promise<Post> {
	const res = await fetch(`${API_BASE_URL}posts`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) {
		await throwPostApiError(res);
	}

	return parsePostResponse(res);
}

export async function getPostById(postId: string | number): Promise<Post> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
		method: "GET",
		credentials: "include",
	});

	if (!res.ok) {
		await throwPostApiError(res);
	}

	return parsePostResponse(res);
}

export async function deletePost(postId: string | number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		await throwPostApiError(res);
	}
}

export async function likePost(
	postId: string | number,
): Promise<PostLikeState> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}/likes`, {
		method: "POST",
		credentials: "include",
	});

	if (!res.ok) {
		await throwPostApiError(res);
	}

	return parsePostLikeResponse(res);
}

export async function unlikePost(
	postId: string | number,
): Promise<PostLikeState> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}/likes`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		await throwPostApiError(res);
	}

	return parsePostLikeResponse(res);
}
