import {
	FiFileText,
	FiThumbsDown,
	FiThumbsUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import type { PostSummary } from "api/Posts";

import { UserAvatar } from "@components/users/UserAvatar";
import {
	getPostCardVariant,
	type PostCardVariant,
} from "@utils/postCardVariant";

type PostCardProps = {
	post: PostSummary;
	onOpen: (postId: number) => void;
};

function getPublicPath(
	filePath: string,
): string {
	return filePath.startsWith("/")
		? filePath
		: `/${filePath}`;
}

function getAttachmentName(
	post: PostSummary,
): string {
	const originalName = post.fileName?.trim();

	if (originalName) {
		return originalName;
	}

	const storedName = post.imagePath
		?.split("/")
		.pop()
		?.trim();

	return storedName || "document.pdf";
}

function formatPostDate(
	value: string,
): string {
	const timestamp = Date.parse(value);

	if (Number.isNaN(timestamp)) {
		return "";
	}

	const differenceInSeconds = Math.floor(
		(Date.now() - timestamp) / 1000,
	);

	if (differenceInSeconds >= 0) {
		if (differenceInSeconds < 60) {
			return "Ahora mismo";
		}

		const minutes = Math.floor(
			differenceInSeconds / 60,
		);

		if (minutes < 60) {
			return `${minutes} min`;
		}

		const hours = Math.floor(
			minutes / 60,
		);

		if (hours < 24) {
			return `${hours} h`;
		}

		const days = Math.floor(
			hours / 24,
		);

		if (days < 7) {
			return `${days} d`;
		}
	}

	return new Intl.DateTimeFormat(
		"es-ES",
		{
			dateStyle: "medium",
			timeStyle: "short",
		},
	).format(new Date(timestamp));
}

function getAbsolutePostDate(
	value: string,
): string {
	const timestamp = Date.parse(value);

	if (Number.isNaN(timestamp)) {
		return value;
	}

	return new Intl.DateTimeFormat(
		"es-ES",
		{
			dateStyle: "full",
			timeStyle: "short",
		},
	).format(new Date(timestamp));
}

function hasImageVariant(
	variant: PostCardVariant,
): boolean {
	return (
		variant === "image" ||
		variant === "text-image"
	);
}

function hasPdfVariant(
	variant: PostCardVariant,
): boolean {
	return (
		variant === "pdf" ||
		variant === "text-pdf"
	);
}

export const PostCard = ({
	post,
	onOpen,
}: PostCardProps) => {
	const variant = getPostCardVariant(post);

	const profilePath =
		`/app/profile/${encodeURIComponent(
			post.author.login,
		)}`;

	const imageSrc =
		hasImageVariant(variant) &&
		post.imagePath
			? getPublicPath(post.imagePath)
			: null;

	const attachmentName =
		getAttachmentName(post);

	return (
		<article
			className={[
				"post-card",
				`post-card--${variant}`,
			].join(" ")}
		>
			{/*
			 * La superficie que abre el post es hermana de los enlaces
			 * del autor. Así evitamos introducir enlaces dentro de botones.
			 */}
			<button
				className="post-card__open-surface"
				type="button"
				aria-label={
					`Abrir la publicación de ${post.author.login}`
				}
				onClick={() => onOpen(post.id)}
			/>

			<div className="post-card__body">
				<header className="post-card__header">
					<div className="post-card__author">
						<Link
							className="post-card__avatar-link"
							to={profilePath}
							aria-label={
								`Abrir el perfil de ${post.author.login}`
							}
						>
							<UserAvatar
								avatarPath={
									post.author.avatarPath
								}
								username={
									post.author.login
								}
								size="small"
								status={null}
								className="post-card__avatar"
							/>
						</Link>

						<Link
							className="post-card__username"
							to={profilePath}
						>
							{post.author.login}
						</Link>
					</div>

					<time
						className="post-card__date"
						dateTime={post.createdAt}
						title={getAbsolutePostDate(
							post.createdAt,
						)}
					>
						{formatPostDate(
							post.createdAt,
						)}
					</time>
				</header>

				{post.content?.trim() && (
					<p className="post-card__content">
						{post.content}
					</p>
				)}

				{imageSrc && (
					<div className="post-card__media">
						<img
							className="post-card__image"
							src={imageSrc}
							alt={
								`Publicación de ${post.author.login}`
							}
							loading="lazy"
						/>
					</div>
				)}

				{hasPdfVariant(variant) && (
					<div className="post-card__document">
						<FiFileText
							className="post-card__document-icon"
							aria-hidden="true"
						/>

						<div className="post-card__document-info">
							<span className="post-card__document-name">
								{attachmentName}
							</span>

							<span className="post-card__document-type">
								PDF
							</span>
						</div>
					</div>
				)}

				<footer className="post-card__reactions">
					<span
						className="post-card__reaction"
						aria-label={
							`${post.likeCount} me gusta`
						}
					>
						<FiThumbsUp aria-hidden="true" />
						<span>{post.likeCount}</span>
					</span>

					<span
						className="post-card__reaction"
						aria-label={
							`${post.dislikeCount} no me gusta`
						}
					>
						<FiThumbsDown aria-hidden="true" />
						<span>{post.dislikeCount}</span>
					</span>
				</footer>
			</div>
		</article>
	);
};
