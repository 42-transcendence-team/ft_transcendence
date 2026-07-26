import { useCallback, useEffect, useState } from "react";

import { Modal } from "@components/Modal";
import { PostModalRenderer } from "@components/posts/PostModalRenderer";
import { PostImageModal } from "@components/posts/PostImageModal";
import { getPostVariant } from "@utils/postVariant";
import { ConfirmModal } from "@components/ConfirmModal";

import { getAuthenticatedUser } from "api/Login";
import {
	deleteComment,
	getCommentsByPostId,
} from "api/Comments";
import type { Comment } from "api/Comments";
import { deletePost, getPostById } from "api/Posts";
import type { Post, PostReactionState } from "api/Posts";

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
	onNotFound?: () => void;
	onReactionUpdated?: (
		reactionState: PostReactionState,
	) => void;
};

type PendingDeletion =
	| { type: "post" }
	| { type: "comment"; commentId: number }
	| null;

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
	onNotFound,
	onReactionUpdated,
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

	// Guarda si se quiere borrar el post o un comentario antes de pedir confirmación.
	const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null);

	const reportPostNotFound = useCallback(() => {
		setPost(null);
		setComments([]);

		// En una ruta directa, el padre sustituye la vista completa por el 404.
		// En otros usos de PostModal, se conserva el mensaje interno de la modal.
		if (onNotFound) {
			onNotFound();
			return;
		}

		setNotFound(true);
	}, [onNotFound]);

	useEffect(() => {
		if (!open) {
			setSelectedImageSrc(null);
			setPendingDeletion(null);
		}
	}, [open]);

	useEffect(() => {
		setSelectedImageSrc(null);
		setPendingDeletion(null);
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
			setPendingDeletion(null);
		};

		const loadPostData = async () => {
			if (!open) {
				resetState();
				return;
			}

			if (!isValidPostId(normalizedPostId)) {
				resetState();
				reportPostNotFound();
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
				setComments([...commentsData].reverse());
			} catch (error) {
				if (ignore) {
					return;
				}

				setPost(null);
				setComments([]);

			const status = getApiErrorStatus(error);

			if (status === 400 || status === 404) {
				reportPostNotFound();
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
	}, [open, normalizedPostId, reportPostNotFound]);

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
				reportPostNotFound();
				return;
			}

			setDeletePostError(getPostDeleteErrorMessage(error));
		} finally {
			setIsDeletingPost(false);
		}
	};

	const handleCommentCreated = (createdComment: Comment) => {
		setComments((currentComments) => [
			createdComment,
			...currentComments,
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

	const requestPostDeletion = () => {
		if (!isDeletingPost) {
			setPendingDeletion({ type: "post" });
		}
	};

	const requestCommentDeletion = (commentId: number) => {
		if (deletingCommentId === null) {
			setPendingDeletion({
				type: "comment",
				commentId,
			});
		}
	};

	const closeDeleteConfirmation = () => {
		setPendingDeletion(null);
	};

	const handleConfirmDeletion = async () => {
		if (!pendingDeletion) {
			return;
		}

		if (pendingDeletion.type === "post") {
			await handlePostDelete();
		} else {
			await handleCommentDelete(pendingDeletion.commentId);
		}

		setPendingDeletion(null);
	};

	const handleReactionChange = (
		reactionState: PostReactionState,
	) => {
		setPost((currentPost) => {
			if (
				!currentPost ||
				currentPost.id !== reactionState.postId
			) {
				return currentPost;
			}
		
			return {
				...currentPost,
				likeCount: reactionState.likeCount,
				dislikeCount:
					reactionState.dislikeCount,
				likedByCurrentUser:
					reactionState.likedByCurrentUser,
				dislikedByCurrentUser:
					reactionState.dislikedByCurrentUser,
			};
		});
	
		// El listado actualiza los contadores de la tarjeta sin recargarse.
		onReactionUpdated?.(reactionState);
	};

	const isPostOwner = Boolean(post && currentUserId === post.userId);

	const modalClassName = post
	? `post-modal-shell post-modal-shell--${getPostVariant(post)}`
	: "post-modal-shell";

	const isPostDeletion = pendingDeletion?.type === "post";

	const confirmationTitle = isPostDeletion
		? "Delete post?"
		: "Delete comment?";

	const confirmationMessage = isPostDeletion
		? "This action cannot be undone. Are you sure you want to delete this post?"
		: "This action cannot be undone. Are you sure you want to delete this comment?";

	const confirmationLabel = isPostDeletion
		? "Delete post"
		: "Delete comment";

	const isConfirmingDeletion =
		pendingDeletion?.type === "post"
			? isDeletingPost
			: pendingDeletion?.type === "comment"
				? deletingCommentId === pendingDeletion.commentId
				: false;

	return (
		<>
			<Modal
				open={open}
				onClose={onClose}
				// Escape solo debe cerrar la modal que se encuentra en primer plano.
				closeOnEscape={!selectedImageSrc && !pendingDeletion}
				modalClassName={modalClassName}
				contentClassName="post-modal-shell__content"
			>
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

					{loadError && !isLoading && (
						<p className="post-modal__error">{loadError}</p>
					)}

					{post && !isLoading && !notFound && !loadError && (
						<PostModalRenderer
							post={post}
							comments={comments}
							currentUserId={currentUserId}
							isOwner={isPostOwner}
							isDeletingPost={isDeletingPost}
							deletingCommentId={deletingCommentId}
							deletePostError={deletePostError}
							commentError={commentError}
							onRequestDeletePost={requestPostDeletion}
							onCommentCreated={handleCommentCreated}
							onRequestDeleteComment={requestCommentDeletion}
							onReactionChange={handleReactionChange}
							onImageClick={setSelectedImageSrc}
						/>
					)}

					<PostImageModal
						open={Boolean(selectedImageSrc)}
						imageSrc={selectedImageSrc}
						onClose={() => setSelectedImageSrc(null)}
					/>
				</div>
			</Modal>

			<ConfirmModal
				open={Boolean(pendingDeletion)}
				title={confirmationTitle}
				message={confirmationMessage}
				confirmLabel={confirmationLabel}
				confirmingLabel="Deleting..."
				cancelLabel="Cancel"
				isConfirming={isConfirmingDeletion}
				onConfirm={handleConfirmDeletion}
				onClose={closeDeleteConfirmation}
			/>
		</>
	);
};
