import { API_BASE_URL, buildApiError } from "api/ApiRequest";
import type { PostAuthor } from "api/Posts";

export type Comment = {
	id: number;
	postId: number;
	userId: number;
	author: PostAuthor;
	content: string;
	createdAt: string;
	updatedAt: string;
};

type CommentApiResponse = {
	message?: string;
	data: Comment;
};

type CommentsApiResponse = {
	data: Comment[];
};

async function parseCommentResponse(res: Response): Promise<Comment> {
	const json = (await res.json()) as CommentApiResponse;
	return json.data;
}

async function parseCommentsResponse(res: Response): Promise<Comment[]> {
	const json = (await res.json()) as CommentsApiResponse;
	return json.data;
}

async function throwCommentApiError(res: Response): Promise<never> {
	const errorData = await res.json().catch(() => null);
	throw buildApiError(res, errorData);
}

export async function getCommentsByPostId(
	postId: string | number,
): Promise<Comment[]> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}/comments`, {
		method: "GET",
		credentials: "include",
	});

	if (!res.ok) {
		await throwCommentApiError(res);
	}

	return parseCommentsResponse(res);
}

export async function createComment(
	postId: string | number,
	content: string,
): Promise<Comment> {
	const res = await fetch(`${API_BASE_URL}posts/${postId}/comments`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ content }),
	});

	if (!res.ok) {
		await throwCommentApiError(res);
	}

	return parseCommentResponse(res);
}

export async function deleteComment(commentId: string | number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}comments/${commentId}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		await throwCommentApiError(res);
	}
}
