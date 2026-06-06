import { useEffect, useState } from "react";

import { Modal } from "@components/Modal";
import { PostDetail } from "@components/posts/PostDetail";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";

import { getAuthenticatedUser } from "api/Login";
import { deletePost, getPostById } from "api/Posts";
import type { Post, PostLikeState } from "api/Posts";
import {
	deleteComment,
	getCommentsByPostId,
} from "api/Comments";
import type { Comment } from "api/Comments";

import {
	getApiErrorStatus,
	getCommentDeleteErrorMessage,
	getGenericApiErrorMessage,
	getPostDeleteErrorMessage,
	getPostLoadErrorMessage,
} from "@utils/apiErrorMessages";

type AuthenticatedUserResponse = {
	user?: {
		id: number;
		login: string;
		email: string;
	};
};

type PostModalProps = {
	open: boolean;
	postId: string | number | null;
	onClose: () => void;
	onDeleted?: () => void;
};

function normalizePostId(postId: string | number | null): string | null {
	if (postId === null) {
		return null;
	}

	return String(postId);
}

function isValidPostId(postId: string | null): postId is string {
	if (!postId) {
		return false;
	}

	return /^\d+$/.test(postId) && Number(postId) > 0;
}

export const PostModal = ({
	open,
	postId,
	onClose,
	onDeleted,
}: PostModalProps) => {
	const normalizedPostId = normalizePostId(postId);

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [isDeletingPost, setIsDeletingPost] = useState(false);
	const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [deletePostError, setDeletePostError] = useState<string | null>(null);
	const [commentError, setCommentError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		let ignore = false;

		const loadPostData = async () => {
			if (!open) {
				return;
			}

			if (!isValidPostId(normalizedPostId)) {
				setPost(null);
				setComments([]);
				setCurrentUserId(null);
				setNotFound(false);
				setError("Invalid post ID.");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);
				setDeletePostError(null);
				setCommentError(null);
				setNotFound(false);

				const [authResponse, postData, commentsData] = await Promise.all([
					getAuthenticatedUser() as Promise<AuthenticatedUserResponse>,
					getPostById(normalizedPostId),
					getCommentsByPostId(normalizedPostId),
				]);

				if (ignore) {
					return;
				}

				setCurrentUserId(authResponse.user?.id ?? null);
				setPost(postData);
				setComments(commentsData);
			} catch (loadError) {
				if (ignore) {
					return;
				}

				setPost(null);
				setComments([]);

				if (getApiErrorStatus(loadError) === 404) {
					setNotFound(true);
					setError(null);
					return;
				}

				setError(getPostLoadErrorMessage(loadError));
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
	}, [open, normalizedPostId]);

	const handlePostDelete = async () => {
		if (!post || isDeletingPost) {
			return;
		}

		try {
			setIsDeletingPost(true);
			setDeletePostError(null);

			await deletePost(post.id);

			if (onDeleted) {
				onDeleted();
				return;
			}

			onClose();
		} catch (deleteError) {
			if (getApiErrorStatus(deleteError) === 404) {
				setNotFound(true);
				setPost(null);
				setDeletePostError(null);
				return;
			}

			setDeletePostError(getPostDeleteErrorMessage(deleteError));
		} finally {
			setIsDeletingPost(false);
		}
	};

	const handleCommentCreated = (createdComment: Comment) => {
		setComments((currentComments) => [
			...currentComments,
			createdComment,
		]);
		setCommentError(null);
	};

	const handleCommentDelete = async (commentId: number) => {
		if (deletingCommentId !== null) {
			return;
		}

		try {
			setDeletingCommentId(commentId);
			setCommentError(null);

			await deleteComment(commentId);

			setComments((currentComments) =>
				currentComments.filter((comment) => comment.id !== commentId),
			);
		} catch (deleteError) {
			if (getApiErrorStatus(deleteError) === 404) {
				setComments((currentComments) =>
					currentComments.filter((comment) => comment.id !== commentId),
				);
				setCommentError("This comment no longer exists.");
				return;
			}

			setCommentError(getCommentDeleteErrorMessage(deleteError));
		} finally {
			setDeletingCommentId(null);
		}
	};

	const handleLikeChange = (likeState: PostLikeState) => {
		setPost((currentPost) => {
			if (!currentPost || currentPost.id !== likeState.postId) {
				return currentPost;
			}

			return {
				...currentPost,
				likeCount: likeState.likeCount,
				likedByCurrentUser: likeState.likedByCurrentUser,
			};
		});
	};

	const isPostOwner = Boolean(post && currentUserId === post.userId);

	return (
		<Modal open={open} onClose={onClose} title="Post">
			<div className="post-modal">
				{isLoading && (
					<p className="post-modal__state">Loading post.</p>
				)}

				{notFound && !isLoading && (
					<div className="post-modal__state">
						<h2>Post not found</h2>
						<p>This post does not exist or has been deleted.</p>
					</div>
				)}

				{error && !isLoading && (
					<p className="post-modal__error">
						{error || getGenericApiErrorMessage(error)}
					</p>
				)}

				{post && !isLoading && !notFound && !error && (
					<>
						<PostDetail
							post={post}
							isOwner={isPostOwner}
							isDeleting={isDeletingPost}
							onDelete={handlePostDelete}
							deleteError={deletePostError}
							onLikeChange={handleLikeChange}
						/>

						<section className="comments post-modal__comments">
							<h2 className="comments__title">Comments</h2>

							<CommentForm
								postId={String(post.id)}
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
					</>
				)}
			</div>
		</Modal>
	);
};
