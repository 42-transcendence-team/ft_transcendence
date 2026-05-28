import { API_BASE_URL, buildApiError } from "./ApiRequest";

export type PostAuthor = {
	id: number;
	login: string;
};

export type Post = {
	id: number;
	userId: number;
	author: PostAuthor;
	content?: string | null;
	imagePath?: string | null;
	createdAt: string;
	updatedAt: string;
};

type PostApiResponse = {
	message?: string;
	data: Post;
};

async function parsePostResponse(res: Response): Promise<Post> {
	const json = (await res.json()) as PostApiResponse;
	return json.data;
}

export async function createPost(formData: FormData): Promise<Post> {
	const res = await fetch(`${API_BASE_URL}posts`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw buildApiError(res, errorData);
	}

	return parsePostResponse(res);
}

export async function getPostById(postId: string | number): Promise<Post> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
		method: "GET",
		credentials: "include",
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw buildApiError(res, errorData);
	}

	return parsePostResponse(res);
}

export async function deletePost(postId: string | number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw buildApiError(res, errorData);
	}
}
