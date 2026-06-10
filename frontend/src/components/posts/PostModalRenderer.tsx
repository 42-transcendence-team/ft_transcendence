import { Link } from "react-router-dom";

import skullLogo from "@icons/skull_logo.png";

import { LikeButton } from "@components/posts/LikeButton";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";

import type { Comment } from "api/Comments";
import type { Post, PostLikeState } from "api/Posts";

import { getPostVariant } from "@utils/postVariant";

type PostModalRendererProps = {
	post: Post;
	comments: Comment[];
	currentUserId: number | null;
	isOwner: boolean;
	isDeletingPost: boolean;
	deletingCommentId: number | null;
	deletePostError: string | null;
	commentError: string | null;
	onDeletePost: () => void;
	onCommentCreated: (comment: Comment) => void;
	onDeleteComment: (commentId: number) => void;
	onLikeChange: (likeState: PostLikeState) => void;
	onImageClick: (imageSrc: string) => void;
};

function getPublicPath(path: string): string {
	if (path.startsWith("/")) {
		return path;
	}

	return `/${path}`;
}

function getAvatarSrc(avatarPath?: string | null): string {
	if (!avatarPath) {
		return skullLogo;
	}

	return getPublicPath(avatarPath);
}

function formatPostDate(value: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export const PostModalRenderer = ({
	post,
	comments,
	currentUserId,
	isOwner,
	isDeletingPost,
	deletingCommentId,
	deletePostError,
	commentError,
	onDeletePost,
	onCommentCreated,
	onDeleteComment,
	onLikeChange,
	onImageClick,
}: PostModalRendererProps) => {
	const variant = getPostVariant(post);
	const imageSrc = post.imagePath ? getPublicPath(post.imagePath) : null;
	const avatarSrc = getAvatarSrc(post.author.avatarPath);
	const hasText = Boolean(post.content?.trim());

	return (
		<article
			className={`post-modal-renderer post-modal-renderer--${variant}`}
		>
			{imageSrc && (
				<div className="post-modal-renderer__image-panel">
					<button
						className="post-modal-renderer__image-button"
						type="button"
						onClick={() => onImageClick(imageSrc)}
						aria-label="Open post image"
					>
						<img
							className="post-modal-renderer__image"
							src={imageSrc}
							alt="Post image"
						/>
					</button>
				</div>
			)}

			<div className="post-modal-renderer__side-panel">
				<header className="post-modal-renderer__header">
					<div className="post-modal-renderer__author">
						<img
							className="post-modal-renderer__avatar"
							src={avatarSrc}
							alt=""
						/>

						<div className="post-modal-renderer__author-info">
							<Link
								className="post-modal-renderer__username"
								to={`/app/profile/${post.author.login}`}
							>
								{post.author.login}
							</Link>

							<time
								className="post-modal-renderer__date"
								dateTime={post.createdAt}
							>
								{formatPostDate(post.createdAt)}
							</time>
						</div>
					</div>

					<div className="post-modal-renderer__actions">
						<LikeButton
							postId={post.id}
							likeCount={post.likeCount}
							likedByCurrentUser={post.likedByCurrentUser}
							onChange={onLikeChange}
						/>

						{isOwner && (
							<button
								className="post-modal-renderer__delete-button"
								type="button"
								onClick={onDeletePost}
								disabled={isDeletingPost}
							>
								{isDeletingPost ? "Deleting." : "Delete"}
							</button>
						)}
					</div>
				</header>

				<div className="post-modal-renderer__body-scroll">
					{hasText && (
						<p className="post-modal-renderer__content">
							{post.content}
						</p>
					)}
					
					{deletePostError && (
						<p className="post-modal-renderer__error">
							{deletePostError}
						</p>
					)}
					
					{hasText && (
						<div className="post-modal-renderer__divider" aria-hidden="true" />
					)}
				
					<section className="post-modal-renderer__comments" aria-label="Comments">
						<CommentList
							comments={comments}
							currentUserId={currentUserId}
							deletingCommentId={deletingCommentId}
							onDelete={onDeleteComment}
						/>

						{commentError && (
							<p className="post-modal-renderer__error">
								{commentError}
							</p>
						)}
					</section>
				</div>
					
				<CommentForm
					postId={post.id}
					onCreated={onCommentCreated}
				/>
			</div>
		</article>
	);
};
