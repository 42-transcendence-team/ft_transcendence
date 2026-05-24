import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { PostDetail } from "@components/posts/PostDetail";
import { getPostById } from "../api/Posts";
import type { Post } from "../api/Posts";

function getErrorMessage(error: unknown): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	return "No se pudo cargar el post.";
}

export const PostDetailPage = () => {
	const { postId } = useParams<{ postId: string }>();

	const [post, setPost] = useState<Post | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let ignore = false;

		const loadPost = async () => {
			if (!postId) {
				setError("Post no válido.");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				const postData = await getPostById(postId);

				if (!ignore) {
					setPost(postData);
				}
			} catch (loadError) {
				if (!ignore) {
					setError(getErrorMessage(loadError));
				}
			} finally {
				if (!ignore) {
					setIsLoading(false);
				}
			}
		};

		loadPost();

		return () => {
			ignore = true;
		};
	}, [postId]);

	if (isLoading) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__loading">Cargando post...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__error">{error}</p>
			</section>
		);
	}

	if (!post) {
		return (
			<section className="post-detail-page">
				<p className="post-detail-page__error">Post no encontrado.</p>
			</section>
		);
	}

	return (
		<section className="post-detail-page">
			<div className="post-detail-page__content">
				<PostDetail post={post} />
			</div>
		</section>
	);
};
