import { ReactionButtons } from "@components/posts/ReactionButtons";

import type { Post, PostReactionState } from "api/Posts";

type PostDetailProps = {
	post: Post;
	isOwner: boolean;
	isDeleting: boolean;
	onDelete: () => void;
	deleteError: string | null;
	onReactionChange: (
		reactionState: PostReactionState,
	) => void;
	onImageClick?: (imageSrc: string) => void;
};

function getPostImageSrc(imagePath: string): string {
	if (imagePath.startsWith("/")) {
		return imagePath;
	}

	return `/${imagePath}`;
}

function formatPostDate(value: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export const PostDetail = ({
	post,
	isOwner,
	isDeleting,
	onDelete,
	deleteError,
	onReactionChange,
	onImageClick,
}: PostDetailProps) => {
	return (
		<article className="post-detail">
			<header className="post-detail__header">
				<div className="post-detail__author-block">
					<p className="post-detail__author">@{post.author.login}</p>
					<time className="post-detail__date" dateTime={post.createdAt}>
						{formatPostDate(post.createdAt)}
					</time>
				</div>

				<div className="post-detail__actions">
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
							className="post-detail__delete-button"
							type="button"
							onClick={onDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting." : "Delete post"}
						</button>
					)}
				</div>
			</header>

			{post.content && (
				<p className="post-detail__content">{post.content}</p>
			)}

			{post.imagePath && (
				<div className="post-detail__image-wrapper">
					{onImageClick ? (
						<button
							className="post-detail__image-button"
							type="button"
							onClick={() => onImageClick(getPostImageSrc(post.imagePath!))}
							aria-label="Open post image"
						>
							<img
								className="post-detail__image"
								src={getPostImageSrc(post.imagePath)}
								alt="Post image"
							/>
						</button>
					) : (
						<img
							className="post-detail__image"
							src={getPostImageSrc(post.imagePath)}
							alt="Post image"
						/>
					)}
				</div>
			)}

			{deleteError && (
				<p className="post-detail__error">{deleteError}</p>
			)}
		</article>
	);
};
