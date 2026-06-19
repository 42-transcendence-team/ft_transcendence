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

/*
 * El backend envuelve el post creado o consultado
 * dentro de la propiedad data.
 */
type PostApiResponse = {
	message?: string;
	data: Post;
};

/*
 * Los endpoints de like devuelven el estado actualizado
 * del like y su contador.
 */
type PostLikeApiResponse = {
	message?: string;
	data: PostLikeState;
};

export async function createPost(formData: FormData): Promise<Post> {
	/*
	 * El post puede incluir una imagen, por lo que se envía como FormData.
	 * apiRequest detecta este tipo de cuerpo y no lo serializa como JSON.
	 */
	const response = await apiRequest<PostApiResponse>({
		endpoint: "posts",
		method: "POST",
		body: formData,
	});

	return response.data;
}

export async function getPostById(
	postId: string | number,
): Promise<Post> {
	const response = await apiRequest<PostApiResponse>({
		endpoint: `posts/${postId}`,
		method: "GET",
	});

	return response.data;
}

export async function deletePost(
	postId: string | number,
): Promise<void> {
	/*
	 * El endpoint puede responder con 204 No Content.
	 * apiRequest admite ahora respuestas correctas sin cuerpo.
	 */
	await apiRequest<void>({
		endpoint: `posts/${postId}`,
		method: "DELETE",
	});
}

export async function likePost(
	postId: string | number,
): Promise<PostLikeState> {
	const response = await apiRequest<PostLikeApiResponse>({
		endpoint: `posts/${postId}/likes`,
		method: "POST",
	});

	return response.data;
}

export async function unlikePost(
	postId: string | number,
): Promise<PostLikeState> {
	const response = await apiRequest<PostLikeApiResponse>({
		endpoint: `posts/${postId}/likes`,
		method: "DELETE",
	});

	return response.data;
}
