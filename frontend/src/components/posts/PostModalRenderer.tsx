import { FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";

import { ReactionButtons } from "@components/posts/ReactionButtons";
import { CommentForm } from "@components/posts/CommentForm";
import { CommentList } from "@components/posts/CommentList";
import { UserAvatar } from "@components/users/UserAvatar";

import type { Comment } from "api/Comments";
import type { Post, PostReactionState } from "api/Posts";

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
	onRequestDeletePost: () => void;
	onCommentCreated: (comment: Comment) => void;
	onRequestDeleteComment: (commentId: number) => void;
	onReactionChange: (
		reactionState: PostReactionState,
	) => void;
	onImageClick: (imageSrc: string) => void;
};

function getPublicPath(path: string): string {
	if (path.startsWith("/")) {
		return path;
	}

	return `/${path}`;
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
	onRequestDeletePost,
	onCommentCreated,
	onRequestDeleteComment,
	onReactionChange,
	onImageClick,
}: PostModalRendererProps) => {
	const variant = getPostVariant(post);
	const imageSrc = post.imagePath
		? getPublicPath(post.imagePath)
		: null;
	const authorProfilePath =
		`/app/profile/${encodeURIComponent(post.author.login)}`;
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
						<Link
							className="post-modal-renderer__avatar-link"
							to={authorProfilePath}
							aria-label={`Open ${post.author.login} profile`}
						>
							<UserAvatar
								avatarPath={post.author.avatarPath}
								username={post.author.login}
								size="medium"
								status={null}
								className="post-modal-renderer__avatar"
							/>
						</Link>

						<div className="post-modal-renderer__author-info">
							<Link
								className="post-modal-renderer__username"
								to={authorProfilePath}
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
						<ReactionButtons
							postId={post.id}
							likeCount={post.likeCount}
							dislikeCount={post.dislikeCount}
							likedByCurrentUser={post.likedByCurrentUser}
							dislikedByCurrentUser={
								post.dislikedByCurrentUser
							}
							onChange={onReactionChange}
						/>

						{isOwner && (
							<button
								className="post-modal-renderer__delete-button"
								type="button"
								onClick={onRequestDeletePost}
								disabled={isDeletingPost}
								aria-label={
									isDeletingPost
										? "Deleting post"
										: "Delete post"
								}
								title={
									isDeletingPost
										? "Deleting post"
										: "Delete post"
								}
							>
								<FiTrash2 size={18} aria-hidden="true" />
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
							onRequestDelete={onRequestDeleteComment}
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
