import type { Post } from "../../api/Posts";

type PostDetailProps = {
	post: Post;
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

export const PostDetail = ({ post }: PostDetailProps) => {
	return (
		<article className="post-detail">
			<header className="post-detail__header">
				<p className="post-detail__author">@{post.author.login}</p>
				<time className="post-detail__date" dateTime={post.createdAt}>
					{formatPostDate(post.createdAt)}
				</time>
			</header>

			{post.content && (
				<p className="post-detail__content">{post.content}</p>
			)}

			{post.imagePath && (
				<div className="post-detail__image-wrapper">
					<img
						className="post-detail__image"
						src={getPostImageSrc(post.imagePath)}
						alt="Imagen del post"
					/>
				</div>
			)}
		</article>
	);
};
