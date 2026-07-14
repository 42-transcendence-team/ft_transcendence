import { useNavigate } from "react-router-dom";

import { PostForm } from "@components/posts/PostForm";
import type { Post } from "../api/Posts";

export const CreatePostPage = () => {
	const navigate = useNavigate();

	const handlePostCreated = (post: Post) => {
		navigate(`/app/posts/${post.id}`);
	};

	return (
		<section className="post-create-page">
			<header className="post-create-page__header">
				<h1 className="post-create-page__title">Nuevo post</h1>
			</header>

			<div className="post-create-page__body">
				<PostForm onCreated={handlePostCreated} />
			</div>
		</section>
	);
};
