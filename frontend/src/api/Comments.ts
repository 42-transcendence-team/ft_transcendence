import { apiRequest } from "api/ApiRequest";
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

/*
 * La creación de un comentario devuelve el nuevo recurso
 * dentro de la propiedad data.
 */
type CommentApiResponse = {
	message?: string;
	data: Comment;
};

/*
 * El listado de comentarios devuelve un array dentro de data.
 */
type CommentsApiResponse = {
	data: Comment[];
};

export async function getCommentsByPostId(
	postId: string | number,
): Promise<Comment[]> {
	const response = await apiRequest<CommentsApiResponse>({
		endpoint: `posts/${postId}/comments`,
		method: "GET",
	});

	return response.data;
}

export async function createComment(
	postId: string | number,
	content: string,
): Promise<Comment> {
	/*
	 * apiRequest serializa este objeto como JSON y añade
	 * automáticamente el Content-Type correspondiente.
	 */
	const response = await apiRequest<CommentApiResponse>({
		endpoint: `posts/${postId}/comments`,
		method: "POST",
		body: { content },
	});

	return response.data;
}

export async function deleteComment(
	commentId: string | number,
): Promise<void> {
	/*
	 * El borrado puede finalizar correctamente sin devolver JSON.
	 */
	await apiRequest<void>({
		endpoint: `comments/${commentId}`,
		method: "DELETE",
	});
}
