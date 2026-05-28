import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getAuthenticatedUser } from "../api/Login";
import { deletePost, getPostById } from "../api/Posts";
import type { Post } from "../api/Posts";
import {
	deleteComment,
	getCommentsByPostId,
} from "../api/Comments";
import type { Comment } from "../api/Comments";

import { PostDetail } from "@components/posts/PostDetail";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";

type AuthenticatedUserResponse = {
	user?: {
		id: number;
		login: string;
		email: string;
	};
};

function getApiStatus(error: unknown): number | null {
	if (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof error.status === "number"
	) {
		return error.status;
	}

	return null;
}

function getErrorMessage(error: unknown): string {
	const status = getApiStatus(error);

	if (status === 403) {
		return "No tienes permisos para realizar esta acción.";
	}

	if (status === 404) {
		return "Este contenido no existe o ya ha sido eliminado.";
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	return "Ha ocurrido un error.";
}

function isValidPostId(postId: string | undefined): postId is string {
	if (!postId) {
		return false;
	}

	return /^\d+$/.test(postId) && Number(postId) > 0;
}

export const PostDetailPage = () => {
	const { postId } = useParams<{ postId: string }>();
	const navigate = useNavigate();

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isDeletingPost, setIsDeletingPost] = useState(false);
	const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [deletePostError, setDeletePostError] = useState<string | null>(null);
	const [commentError, setCommentError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		let ignore = false;

		const loadPostData = async () => {
			if (!isValidPostId(postId)) {
				setError("Post no válido.");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);
				setNotFound(false);

				const [postData, commentsData, userData] = await Promise.all([
					getPostById(postId),
					getCommentsByPostId(postId),
					getAuthenticatedUser(),
				]);

				if (!ignore) {
					const authData = userData as AuthenticatedUserResponse;

					setPost(postData);
					setComments(commentsData);
					setCurrentUserId(authData.user?.id ?? null);
				}
			} catch (loadError) {
				if (ignore) {
					return;
				}

				if (getApiStatus(loadError) === 404) {
					setNotFound(true);
					return;
				}

				setError(getErrorMessage(loadError));
			} finally {
				if (!ignore) {
					setIsLoading(false);
				}
			}
		};

		loadPostData();

		return () => {
			ignore = true;
		};
	}, [postId]);

	const handlePostDelete = async () => {
		if (!post) {
			return;
		}

		const confirmed = window.confirm("¿Seguro que quieres borrar este post?");
		if (!confirmed) {
			return;
		}

		try {
			setIsDeletingPost(true);
			setDeletePostError(null);

			await deletePost(post.id);

			navigate("/app");
		} catch (deleteError) {
			if (getApiStatus(deleteError) === 404) {
				setNotFound(true);
				return;
			}

			setDeletePostError(getErrorMessage(deleteError));
		} finally {
			setIsDeletingPost(false);
		}
	};

	const handleCommentCreated = (comment: Comment) => {
		setComments((currentComments) => [...currentComments, comment]);
	};

	const handleCommentDelete = async (commentId: number) => {
		try {
			setDeletingCommentId(commentId);
			setCommentError(null);

			await deleteComment(commentId);

			setComments((currentComments) =>
				currentComments.filter((comment) => comment.id !== commentId),
			);
		} catch (deleteError) {
			if (getApiStatus(deleteError) === 404) {
				setComments((currentComments) =>
					currentComments.filter((comment) => comment.id !== commentId),
				);
				setCommentError("El comentario ya no existe.");
				return;
			}

			setCommentError(getErrorMessage(deleteError));
		} finally {
			setDeletingCommentId(null);
		}
	};

	if (isLoading) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__loading">Cargando post...</p>
			</section>
		);
	}

	if (notFound) {
		return (
			<section className="post-detail-page post-detail-page__not-found">
				<h1>Post no encontrado</h1>
				<p>Este post no existe o ha sido eliminado.</p>
				<Link className="post-detail-page__back-link" to="/app">
					Volver al inicio
				</Link>
			</section>
		);
	}

	if (error) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__error">{error}</p>
				<Link className="post-detail-page__back-link" to="/app">
					Volver al inicio
				</Link>
			</section>
		);
	}

	if (!post || !postId) {
		return (
			<section className="post-detail-page post-detail-page__not-found">
				<h1>Post no encontrado</h1>
				<p>Este post no existe o ha sido eliminado.</p>
				<Link className="post-detail-page__back-link" to="/app">
					Volver al inicio
				</Link>
			</section>
		);
	}

	const isPostOwner = currentUserId === post.userId;

	return (
		<section className="post-detail-page">
			<div className="post-detail-page__content">
				<PostDetail
					post={post}
					isOwner={isPostOwner}
					isDeleting={isDeletingPost}
					onDelete={handlePostDelete}
					deleteError={deletePostError}
				/>

				<section className="comments">
					<h2 className="comments__title">Comentarios</h2>

					<CommentForm
						postId={postId}
						onCreated={handleCommentCreated}
					/>

					{commentError && (
						<p className="comments__error">{commentError}</p>
					)}

					<CommentList
						comments={comments}
						currentUserId={currentUserId}
						deletingCommentId={deletingCommentId}
						onDelete={handleCommentDelete}
					/>
				</section>
			</div>
		</section>
	);
};
