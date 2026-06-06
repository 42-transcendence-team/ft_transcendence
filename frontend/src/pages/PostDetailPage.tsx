import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getAuthenticatedUser } from "api/Login";
import { deletePost, getPostById } from "api/Posts";
import type { Post, PostLikeState } from "api/Posts";
import {
	deleteComment,
	getCommentsByPostId,
} from "api/Comments";
import type { Comment } from "api/Comments";

import { PostDetail } from "@components/posts/PostDetail";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";

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
				setError("Invalid post ID.");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);
				setNotFound(false);

				const [authResponse, postData, commentsData] = await Promise.all([
					getAuthenticatedUser() as Promise<AuthenticatedUserResponse>,
					getPostById(postId),
					getCommentsByPostId(postId),
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
	}, [postId]);

	const handlePostDelete = async () => {
		if (!post) {
			return;
		}

		try {
			setIsDeletingPost(true);
			setDeletePostError(null);

			await deletePost(post.id);

			navigate("/app");
		} catch (deleteError) {
			if (getApiErrorStatus(deleteError) === 404) {
				setNotFound(true);
				setPost(null);
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

	if (isLoading) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__loading">Loading post...</p>
			</section>
		);
	}

	if (notFound) {
		return (
			<section className="post-detail-page post-detail-page__not-found">
				<h1>Post not found</h1>
				<p>This post does not exist or has been deleted.</p>
				<Link className="post-detail-page__back-link" to="/app">
					Back to home
				</Link>
			</section>
		);
	}

	if (error) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__error">
					{error || getGenericApiErrorMessage(error)}
				</p>
				<Link className="post-detail-page__back-link" to="/app">
					Back to home
				</Link>
			</section>
		);
	}

	if (!post || !postId) {
		return (
			<section className="post-detail-page post-detail-page__not-found">
				<h1>Post not found</h1>
				<p>This post does not exist or has been deleted.</p>
				<Link className="post-detail-page__back-link" to="/app">
					Back to home
				</Link>
			</section>
		);
	}

	const isPostOwner = currentUserId === post.userId;

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

	return (
		<section className="post-detail-page">
			<div className="post-detail-page__content">
				<PostDetail
					post={post}
					isOwner={isPostOwner}
					isDeleting={isDeletingPost}
					onDelete={handlePostDelete}
					deleteError={deletePostError}
					onLikeChange={handleLikeChange}
				/>

				<section className="comments">
					<h2 className="comments__title">Comments</h2>

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
