import { useEffect, useState } from "react";

import { Modal } from "@components/Modal";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";
import { PostDetail } from "@components/posts/PostDetail";
import { PostImageModal } from "@components/posts/PostImageModal";

import { getAuthenticatedUser } from "api/Login";
import {
	deleteComment,
	getCommentsByPostId,
} from "api/Comments";
import type { Comment } from "api/Comments";
import { deletePost, getPostById } from "api/Posts";
import type { Post, PostLikeState } from "api/Posts";

import {
	getApiErrorStatus,
	getCommentDeleteErrorMessage,
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
	const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
		null,
	);

	const [loadError, setLoadError] = useState<string | null>(null);
	const [deletePostError, setDeletePostError] = useState<string | null>(null);
	const [commentError, setCommentError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setSelectedImageSrc(null);
		}
	}, [open]);

	useEffect(() => {
		setSelectedImageSrc(null);
	}, [normalizedPostId]);

	useEffect(() => {
		let ignore = false;

		const resetState = () => {
			setPost(null);
			setComments([]);
			setCurrentUserId(null);
			setIsLoading(false);
			setIsDeletingPost(false);
			setDeletingCommentId(null);
			setLoadError(null);
			setDeletePostError(null);
			setCommentError(null);
			setNotFound(false);
		};

		const loadPostData = async () => {
			if (!open) {
				resetState();
				return;
			}

			if (!isValidPostId(normalizedPostId)) {
				resetState();
				setLoadError("Invalid post ID.");
				return;
			}

			try {
				setIsLoading(true);
				setLoadError(null);
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
			} catch (error) {
				if (ignore) {
					return;
				}

				setPost(null);
				setComments([]);

				if (getApiErrorStatus(error) === 404) {
					setNotFound(true);
					return;
				}

				setLoadError(getPostLoadErrorMessage(error));
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
		} catch (error) {
			if (getApiErrorStatus(error) === 404) {
				setPost(null);
				setNotFound(true);
				return;
			}

			setDeletePostError(getPostDeleteErrorMessage(error));
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
		} catch (error) {
			if (getApiErrorStatus(error) === 404) {
				setComments((currentComments) =>
					currentComments.filter((comment) => comment.id !== commentId),
				);
				setCommentError("This comment no longer exists.");
				return;
			}

			setCommentError(getCommentDeleteErrorMessage(error));
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
		<Modal
			open={open}
			onClose={onClose}
			title="Post"
			closeOnEscape={!selectedImageSrc}
		>
			<div className="post-modal">
				{isLoading && <p className="post-modal__state">Loading post.</p>}

				{notFound && !isLoading && (
					<div className="post-modal__state">
						<h2>Post not found</h2>
						<p>This post does not exist or has been deleted.</p>
					</div>
				)}

				{loadError && !isLoading && (
					<p className="post-modal__error">{loadError}</p>
				)}

				{post && !isLoading && !notFound && !loadError && (
					<>
						<PostDetail
							post={post}
							isOwner={isPostOwner}
							isDeleting={isDeletingPost}
							onDelete={handlePostDelete}
							deleteError={deletePostError}
							onLikeChange={handleLikeChange}
							onImageClick={setSelectedImageSrc}
						/>

						<section className="comments post-modal__comments">
							<h2 className="comments__title">Comments</h2>

							<CommentForm
								postId={post.id}
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

				<PostImageModal
					open={Boolean(selectedImageSrc)}
					imageSrc={selectedImageSrc}
					onClose={() => setSelectedImageSrc(null)}
				/>
			</div>
		</Modal>
	);
};
