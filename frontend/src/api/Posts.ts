import { apiRequest } from "api/ApiRequest";

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
	fileName?: string | null;

	likeCount: number;
	dislikeCount: number;
	likedByCurrentUser: boolean;
	dislikedByCurrentUser: boolean;

	createdAt: string;
	updatedAt: string;
};

export type PostSummary = {
	id: number;
	userId: number;
	author: PostAuthor;
	content?: string | null;
	imagePath?: string | null;
	fileName?: string | null;
	likeCount: number;
	dislikeCount: number;
	likedByCurrentUser: boolean;
	dislikedByCurrentUser: boolean;
	createdAt: string;
};

export type PostPagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type PostsPage = {
	data: PostSummary[];
	pagination: PostPagination;
};

export type PostReactionState = {
	postId: number;
	likeCount: number;
	dislikeCount: number;
	likedByCurrentUser: boolean;
	dislikedByCurrentUser: boolean;
};

/*
 * El backend envuelve el post creado o consultado
 * dentro de la propiedad data.
 */
type PostApiResponse = {
	message?: string;
	data: Post;
};

/*
 * Los endpoints de reacción devuelven los contadores
 * y la reacción actualizada del usuario autenticado.
 */
type PostReactionApiResponse = {
	message?: string;
	data: PostReactionState;
};

function buildPostListEndpoint(
	path: string,
	page: number,
	limit: number,
): string {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return `${path}?${query.toString()}`;
}

export async function createPost(
	formData: FormData,
): Promise<Post> {
	/*
	 * El post puede incluir una imagen o PDF, por lo que se envía
	 * como FormData. apiRequest no serializa este cuerpo como JSON.
	 */
	const response =
		await apiRequest<PostApiResponse>({
			endpoint: "posts",
			method: "POST",
			body: formData,
		});

	return response.data;
}

export async function getPostById(
	postId: string | number,
): Promise<Post> {
	const response =
		await apiRequest<PostApiResponse>({
			endpoint: `posts/${postId}`,
			method: "GET",
		});

	return response.data;
}

export async function getFeedPosts(
	page = 1,
	limit = 20,
): Promise<PostsPage> {
	return apiRequest<PostsPage>({
		endpoint: buildPostListEndpoint(
			"posts/feed",
			page,
			limit,
		),
		method: "GET",
	});
}

export async function getPostsByUserId(
	userId: number,
	page = 1,
	limit = 20,
): Promise<PostsPage> {
	return apiRequest<PostsPage>({
		endpoint: buildPostListEndpoint(
			`posts/user/${userId}`,
			page,
			limit,
		),
		method: "GET",
	});
}

export async function deletePost(
	postId: string | number,
): Promise<void> {
	/*
	 * El endpoint puede responder con 204 No Content.
	 */
	await apiRequest<void>({
		endpoint: `posts/${postId}`,
		method: "DELETE",
	});
}

export async function likePost(
	postId: string | number,
): Promise<PostReactionState> {
	const response =
		await apiRequest<PostReactionApiResponse>({
			endpoint: `posts/${postId}/likes`,
			method: "POST",
		});

	return response.data;
}

export async function unlikePost(
	postId: string | number,
): Promise<PostReactionState> {
	const response =
		await apiRequest<PostReactionApiResponse>({
			endpoint: `posts/${postId}/likes`,
			method: "DELETE",
		});

	return response.data;
}

export async function dislikePost(
	postId: string | number,
): Promise<PostReactionState> {
	const response =
		await apiRequest<PostReactionApiResponse>({
			endpoint: `posts/${postId}/dislikes`,
			method: "POST",
		});

	return response.data;
}

export async function undislikePost(
	postId: string | number,
): Promise<PostReactionState> {
	const response =
		await apiRequest<PostReactionApiResponse>({
			endpoint: `posts/${postId}/dislikes`,
			method: "DELETE",
		});

	return response.data;
}
